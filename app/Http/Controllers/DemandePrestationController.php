<?php

namespace App\Http\Controllers;

use App\Models\DemandePrestation;
use App\Models\ProfilTalent;
use App\Mail\NouvelleDemandeMail;
use App\Mail\ReponseDemandeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class DemandePrestationController extends Controller
{
    /**
     * Liste des demandes envoyées par le client connecté (paginée, 10/page).
     * GET /api/client/demandes
     */
    public function indexClient(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $demandes = DemandePrestation::where('client_id', $request->user()->id)
            ->with(['profilTalent.utilisateur.categorie'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $demandes->getCollection()->map(fn ($d) => $this->formatPourClient($d)),
            'meta' => [
                'current_page' => $demandes->currentPage(),
                'last_page' => $demandes->lastPage(),
                'total' => $demandes->total(),
                'per_page' => $demandes->perPage(),
            ],
        ]);
    }

    /**
     * Liste des demandes reçues par le talent connecté.
     * GET /api/talent/demandes
     */
    public function indexTalent(Request $request)
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');

        $profil = $request->user()->profilTalent;

        if (!$profil) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        $demandes = DemandePrestation::where('profil_talent_id', $profil->id)
            ->with(['client'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $demandes->map(fn ($d) => $this->formatPourTalent($d)),
        ]);
    }

    /**
     * Envoie une nouvelle demande de prestation à un talent.
     * POST /api/client/demandes
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $validator = Validator::make($request->all(), [
            'profil_talent_id' => 'required|exists:profils_talents,id',
            'message_initial' => 'required|string|max:1000',
            'date_souhaitee' => 'nullable|date|after_or_equal:today',
            'budget' => 'nullable|numeric|min:0',
        ], [
            'message_initial.required' => 'Veuillez rédiger un message avant d\'envoyer.',
            'date_souhaitee.after_or_equal' => 'La date souhaitée ne peut pas être dans le passé.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profil = ProfilTalent::with('utilisateur')->find($request->profil_talent_id);

        if (!$profil || $profil->utilisateur?->statut !== 'valide') {
            return response()->json(['message' => 'Ce talent n\'est plus disponible sur la plateforme.'], 404);
        }

        $demande = DemandePrestation::create([
            'client_id' => $request->user()->id,
            'profil_talent_id' => $profil->id,
            'statut' => 'en_attente',
            'message_initial' => $request->message_initial,
            'date_souhaitee' => $request->date_souhaitee,
            'budget' => $request->budget,
        ]);

        try {
            Mail::to($profil->utilisateur->email)->queue(new NouvelleDemandeMail($demande));
        } catch (\Exception $e) {}

        return response()->json([
            'success' => true,
            'data' => $this->formatPourClient($demande->load('profilTalent.utilisateur.categorie')),
        ], 201);
    }

    /**
     * Le talent accepte ou refuse une demande reçue.
     * PATCH /api/talent/demandes/{id}
     */
    public function repondre(Request $request, $id)
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');

        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:acceptee,refusee',
            'motif_refus' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profil = $request->user()->profilTalent;
        $demande = DemandePrestation::where('profil_talent_id', $profil->id)
            ->with('client')
            ->find($id);

        if (!$demande) {
            return response()->json(['message' => 'Demande introuvable.'], 404);
        }

        if ($demande->statut !== 'en_attente') {
            return response()->json(['message' => 'Cette demande a déjà reçu une réponse.'], 422);
        }

        $demande->update(['statut' => $request->statut]);

        try {
            Mail::to($demande->client->email)->queue(
                new ReponseDemandeMail($demande, $request->motif_refus)
            );
        } catch (\Exception $e) {}

        return response()->json([
            'success' => true,
            'data' => $this->formatPourTalent($demande->fresh()),
        ]);
    }

    private function formatPourClient(DemandePrestation $d): array
    {
        $profil = $d->profilTalent;

        return [
            'id' => $d->id,
            'talent_id' => $profil->id,
            'talent_nom' => trim(($profil->utilisateur->prenom ?? '') . ' ' . ($profil->utilisateur->nom ?? '')),
            'categorie' => $profil->utilisateur->categorie->nom ?? '—',
            'statut' => $d->statut,
            'message_initial' => $d->message_initial,
            'date_souhaitee' => $d->date_souhaitee,
            'budget' => $d->budget,
            'created_at' => $d->created_at,
        ];
    }

    private function formatPourTalent(DemandePrestation $d): array
    {
        return [
            'id' => $d->id,
            'client_nom' => trim(($d->client->prenom ?? '') . ' ' . ($d->client->nom ?? '')),
            'statut' => $d->statut,
            'message_initial' => $d->message_initial,
            'date_souhaitee' => $d->date_souhaitee,
            'budget' => $d->budget,
            'created_at' => $d->created_at,
        ];
    }

    /**
 * Le client annule une demande qu'il a envoyée, tant qu'elle est
 * encore en attente (pas encore acceptée/refusée par le talent).
 * DELETE /api/client/demandes/{id}
 */
public function annuler(Request $request, $id)
{
    abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

    $demande = DemandePrestation::where('client_id', $request->user()->id)->find($id);

    if (!$demande) {
        return response()->json(['message' => 'Demande introuvable.'], 404);
    }

    if ($demande->statut !== 'en_attente') {
        return response()->json(['message' => 'Cette demande a déjà reçu une réponse, elle ne peut plus être annulée.'], 422);
    }

    $demande->delete();

    return response()->json(['success' => true]);
}

}
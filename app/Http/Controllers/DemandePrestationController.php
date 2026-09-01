<?php

namespace App\Http\Controllers;

use App\Models\DemandePrestation;
use App\Models\ProfilTalent;
use App\Mail\NouvelleDemandeMail;
use App\Mail\ReponseDemandeMail;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class DemandePrestationController extends Controller
{
    /**
     * Liste des demandes envoyées par le client connecté (paginée, 10/page).
     * GET /api/client/demandes
     * GET /api/client/demandes?statut=acceptee   -> filtre la liste uniquement
     *
     * `counts` dans la réponse reflète TOUJOURS le total sur l'ensemble des
     * demandes du client, peu importe le filtre `statut` demandé — sinon les
     * compteurs des boutons de filtre (Total/En attente/Acceptées/Refusées/
     * Terminées) changeraient de valeur selon le filtre actif, ce qui serait
     * faux.
     */
    public function indexClient(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $clientId = $request->user()->id;

        $query = DemandePrestation::where('client_id', $clientId)
            ->where('statut', '!=', 'conversation')
            ->with(['profilTalent.utilisateur.categorie']);

        if ($request->filled('statut') && in_array($request->statut, ['en_attente', 'acceptee', 'refusee', 'terminee'])) {
            $query->where('statut', $request->statut);
        }

        $demandes = $query->latest()->paginate(10);

        // ✅ 'conversation' exclu ici aussi, sinon il gonflerait le total
        // "Toutes" sans jamais apparaître dans un des compteurs détaillés.
        $countsParStatut = DemandePrestation::where('client_id', $clientId)
            ->where('statut', '!=', 'conversation')
            ->selectRaw('statut, count(*) as total')
            ->groupBy('statut')
            ->pluck('total', 'statut');

        return response()->json([
            'success' => true,
            'data' => $demandes->getCollection()->map(fn ($d) => $this->formatPourClient($d)),
            'meta' => [
                'current_page' => $demandes->currentPage(),
                'last_page' => $demandes->lastPage(),
                'total' => $demandes->total(),
                'per_page' => $demandes->perPage(),
            ],
            'counts' => [
                'all' => $countsParStatut->sum(),
                'en_attente' => $countsParStatut->get('en_attente', 0),
                'acceptee' => $countsParStatut->get('acceptee', 0),
                'refusee' => $countsParStatut->get('refusee', 0),
                'terminee' => $countsParStatut->get('terminee', 0),
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
            ->where('statut', '!=', 'conversation')
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
        'date_souhaitee' => 'required|date|after_or_equal:today',
        'budget' => 'required|numeric|min:0',
    ], [
        'message_initial.required' => 'Veuillez rédiger un message avant d\'envoyer.',
        'date_souhaitee.required' => 'La date souhaitée est requise.',
        'date_souhaitee.after_or_equal' => 'La date souhaitée ne peut pas être dans le passé.',
        'budget.required' => 'Le budget est requis.',
        'budget.numeric' => 'Le budget doit être un nombre.',
        'budget.min' => 'Le budget ne peut pas être négatif.',
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

    NotificationService::creer(
        $profil->utilisateur,
        'nouvelle_demande',
        "Nouvelle demande de prestation de {$request->user()->prenom} {$request->user()->nom}",
        ['demande_id' => $demande->id]
    );

    return response()->json([
        'success' => true,
        'data' => $this->formatPourClient($demande->load('profilTalent.utilisateur.categorie')),
    ], 201);
}
    /**
     * Le talent répond à une demande reçue :
     * - en_attente -> acceptee / refusee
     * - acceptee   -> terminee
     * PATCH /api/talent/demandes/{id}
     */
    public function repondre(Request $request, $id)
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');

        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:acceptee,refusee,terminee',
            'motif_refus' => 'nullable|string|max:500',
            'livrable_url' => 'required_if:statut,terminee|nullable|string|max:2048',
            'livrable_public_id' => 'nullable|string|max:255',
            'livrable_nom_fichier' => 'nullable|string|max:255',
            'livrable_message' => 'nullable|string|max:1000',
        ], [
            'livrable_url.required_if' => 'Veuillez joindre le livrable avant de marquer comme terminé.',
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

        $transitionsValides = [
            'acceptee' => 'en_attente',
            'refusee' => 'en_attente',
            'terminee' => 'acceptee',
        ];

        if ($demande->statut !== $transitionsValides[$request->statut]) {
            return response()->json(['message' => 'Cette action n\'est pas possible dans l\'état actuel de la demande.'], 422);
        }

        $dataMaj = ['statut' => $request->statut];

        if ($request->statut === 'terminee') {
            $dataMaj['livrable_url'] = $request->livrable_url;
            $dataMaj['livrable_public_id'] = $request->livrable_public_id;
            $dataMaj['livrable_nom_fichier'] = $request->livrable_nom_fichier;
            $dataMaj['livrable_message'] = $request->livrable_message;
            $dataMaj['livrable_date'] = now();
        }

        $demande->update($dataMaj);

        if (in_array($request->statut, ['acceptee', 'refusee'])) {
            try {
                Mail::to($demande->client->email)->queue(
                    new ReponseDemandeMail($demande, $request->motif_refus)
                );
            } catch (\Exception $e) {}

            $talentNom = trim(($profil->utilisateur->prenom ?? '') . ' ' . ($profil->utilisateur->nom ?? ''));
            $message = $request->statut === 'acceptee'
                ? "Votre demande a été acceptée par {$talentNom}"
                : "Votre demande a été refusée par {$talentNom}";

            NotificationService::creer(
                $demande->client,
                $request->statut === 'acceptee' ? 'demande_acceptee' : 'demande_refusee',
                $message,
                ['demande_id' => $demande->id]
            );
        }

        if ($request->statut === 'terminee') {
            $talentNom = trim(($profil->utilisateur->prenom ?? '') . ' ' . ($profil->utilisateur->nom ?? ''));

            NotificationService::creer(
                $demande->client,
                'demande_terminee',
                "{$talentNom} a marqué votre prestation comme terminée",
                ['demande_id' => $demande->id]
            );
        }

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
            'livrable_url' => $d->livrable_url,
            'livrable_nom_fichier' => $d->livrable_nom_fichier,
            'livrable_message' => $d->livrable_message,
            'livrable_date' => $d->livrable_date,
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
            'livrable_url' => $d->livrable_url,
            'livrable_nom_fichier' => $d->livrable_nom_fichier,
            'livrable_message' => $d->livrable_message,
            'livrable_date' => $d->livrable_date,
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
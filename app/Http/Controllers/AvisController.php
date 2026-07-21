<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\DemandePrestation;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvisController extends Controller
{
    /**
     * Le client laisse un avis sur un talent, rattaché à une demande terminée.
     * POST /api/client/avis
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $validator = Validator::make($request->all(), [
            'demande_prestation_id' => 'required|exists:demandes_prestation,id',
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // ✅ Eager-load profilTalent.utilisateur : nécessaire pour notifier
        // le talent juste après la création de l'avis, sans requête en plus.
        $demande = DemandePrestation::with('profilTalent.utilisateur')
            ->where('id', $request->demande_prestation_id)
            ->where('client_id', $request->user()->id)
            ->first();

        if (!$demande) {
            return response()->json(['message' => 'Demande introuvable.'], 404);
        }

        // ✅ Un avis ne peut être laissé que pour une prestation TERMINÉE
        // (avant : vérifiait 'acceptee', désynchronisé du frontend qui
        // n'affiche le bouton "Laisser un avis" que sur statut 'terminee').
        if ($demande->statut !== 'terminee') {
            return response()->json(['message' => 'Vous ne pouvez laisser un avis que pour une demande terminée.'], 422);
        }

        $dejaNote = Avis::where('demande_prestation_id', $demande->id)->exists();

        if ($dejaNote) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour cette demande.'], 422);
        }

        $avis = Avis::create([
            'client_id' => $request->user()->id,
            'profil_talent_id' => $demande->profil_talent_id,
            'demande_prestation_id' => $demande->id,
            'note' => $request->note,
            'commentaire' => $request->commentaire,
            'statut' => 'visible',
        ]);

        // ✅ Notifie le talent qu'il a reçu un nouvel avis sur son profil.
        NotificationService::creer(
            $demande->profilTalent->utilisateur,
            'nouvel_avis',
            "{$request->user()->prenom} {$request->user()->nom} a laissé un avis sur votre profil",
            ['talent_id' => $demande->profil_talent_id]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $avis->id,
                'note' => $avis->note,
                'commentaire' => $avis->commentaire,
            ],
        ], 201);
    }

    /**
     * Meilleurs avis publics, tous talents confondus — utilisé pour la
     * section "Témoignages" de la page d'accueil. Public (pas d'auth).
     * GET /api/avis?limit=6
     *
     * ⚠️ Nom du client limité à "Prénom N." : ces avis ont été laissés dans
     * un contexte privé (une demande de prestation), pas dans l'idée d'être
     * exposés publiquement — donc pas de nom de famille complet ici.
     */
    public function indexPublic(Request $request)
    {
        $limit = min((int) $request->input('limit', 6), 20);

        $avis = Avis::where('statut', 'visible')
            ->whereNotNull('commentaire')
            ->where('commentaire', '!=', '')
            ->with(['client', 'profilTalent.utilisateur'])
            ->orderByDesc('note')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($a) {
                $nomFamille = $a->client?->nom ? mb_substr($a->client->nom, 0, 1) . '.' : '';

                return [
                    'id' => $a->id,
                    'nom' => trim(($a->client?->prenom ?? 'Client') . ' ' . $nomFamille),
                    'ville' => $a->client?->ville ?? null,
                    'note' => $a->note,
                    'commentaire' => $a->commentaire,
                    // Pas d'avatar personnel exposé publiquement — voir même
                    // logique que resolvePhotoUrl() ailleurs si tu veux
                    // finalement en afficher un plus tard.
                    'avatar' => null,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $avis,
        ]);
    }

    /**
     * Liste des avis laissés par le client connecté (pour savoir lesquels
     * ont déjà été notés, et éviter de proposer le bouton en double).
     * GET /api/client/avis
     */
    public function indexClient(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $avis = Avis::where('client_id', $request->user()->id)
            ->get(['id', 'demande_prestation_id', 'note', 'commentaire']);

        return response()->json([
            'success' => true,
            'data' => $avis,
        ]);
    }

    /**
     * Liste des avis reçus par le talent connecté.
     * GET /api/talent/avis
     */
    public function indexTalent(Request $request)
    {
        abort_unless($request->user()->isTalent(), 403, 'Réservé aux talents.');

        $profil = $request->user()->profilTalent;

        if (!$profil) {
            return response()->json(['message' => 'Profil introuvable.'], 404);
        }

        $avis = Avis::where('profil_talent_id', $profil->id)
            ->where('statut', 'visible')
            ->with('client')
            ->latest()
            ->get()
            ->map(function ($a) {
                return [
                    'id' => $a->id,
                    'client_nom' => trim(($a->client->prenom ?? '') . ' ' . ($a->client->nom ?? '')),
                    'note' => $a->note,
                    'commentaire' => $a->commentaire,
                    'created_at' => $a->created_at,
                ];
            });

        $moyenneNote = $avis->count() > 0 ? round($avis->avg('note'), 1) : 0;

        return response()->json([
            'success' => true,
            'data' => $avis,
            'moyenne' => $moyenneNote,
            'total' => $avis->count(),
        ]);
    }
}
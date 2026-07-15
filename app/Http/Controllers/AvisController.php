<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\DemandePrestation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AvisController extends Controller
{
    /**
     * Le client laisse un avis sur un talent, rattaché à une demande acceptée.
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

        $demande = DemandePrestation::where('id', $request->demande_prestation_id)
            ->where('client_id', $request->user()->id)
            ->first();

        if (!$demande) {
            return response()->json(['message' => 'Demande introuvable.'], 404);
        }

        if ($demande->statut !== 'acceptee') {
            return response()->json(['message' => 'Vous ne pouvez laisser un avis que pour une demande acceptée.'], 422);
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
}
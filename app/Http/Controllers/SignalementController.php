<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use App\Models\Signalement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SignalementController extends Controller
{
    private const MOTIFS_VALIDES = [
        'contenu_inapproprie',
        'faux_profil',
        'arnaque',
        'comportement_abusif',
        'autre',
    ];

    /**
     * Le client signale un compte talent.
     * POST /api/client/signalements
     */
    public function store(Request $request)
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');

        $validator = Validator::make($request->all(), [
            'profil_talent_id' => 'required|exists:profils_talents,id',
            'motif' => 'required|in:' . implode(',', self::MOTIFS_VALIDES),
            'description' => 'nullable|string|max:1000',
        ], [
            'motif.required' => 'Veuillez indiquer un motif.',
            'motif.in' => 'Motif invalide.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $profil = ProfilTalent::find($request->profil_talent_id);

        if (!$profil) {
            return response()->json(['message' => 'Talent introuvable.'], 404);
        }

        // Empêche le spam : un client ne peut signaler le même talent
        // qu'une fois par jour.
        $dejaSignaleAujourdhui = Signalement::where('client_id', $request->user()->id)
            ->where('profil_talent_id', $profil->id)
            ->whereDate('created_at', today())
            ->exists();

        if ($dejaSignaleAujourdhui) {
            return response()->json(['message' => 'Vous avez déjà signalé ce profil aujourd\'hui.'], 422);
        }

        $signalement = Signalement::create([
            'client_id' => $request->user()->id,
            'profil_talent_id' => $profil->id,
            'motif' => $request->motif,
            'description' => $request->description,
            'statut' => 'en_attente',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Signalement envoyé. Notre équipe va l\'examiner.',
            'data' => ['id' => $signalement->id],
        ], 201);
    }
}
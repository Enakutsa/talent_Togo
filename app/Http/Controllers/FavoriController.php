<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use App\Models\ProfilTalent;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    private function assertClient(Request $request): void
    {
        abort_unless($request->user()->isClient(), 403, 'Réservé aux clients.');
    }

    /**
     * Liste des talents favoris du client connecté.
     * GET /api/client/favoris
     */
    public function index(Request $request)
{
    $this->assertClient($request);

    $favoris = Favori::where('client_id', $request->user()->id)
        ->with(['profilTalent.utilisateur.categorie', 'profilTalent.portfolios'])
        ->latest()
        ->get();

    $data = $favoris->map(function ($favori) {
        $profil = $favori->profilTalent;

        $photo = $profil->photo;
        $avatarUrl = $photo
            ? ((str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://'))
                ? $photo
                : asset('storage/' . $photo))
            : null;

        return [
            'favori_id' => $favori->id,
            'talent_id' => $profil->id,
            'nom' => trim(($profil->utilisateur->prenom ?? '') . ' ' . ($profil->utilisateur->nom ?? '')),
            'categorie' => $profil->utilisateur->categorie->nom ?? '—',
            'ville' => $profil->utilisateur->ville ?? null,
            'tarif' => (float) ($profil->tarif_min ?? 0),
            'disponible' => (bool) $profil->disponibilite,
            'avatar' => $avatarUrl,
            'note' => 0,
            'avis' => 0,
        ];
    });

    return response()->json([
        'success' => true,
        'data' => $data,
    ]);
}
    /**
     * Ajoute ou retire un talent des favoris (toggle).
     * POST /api/client/favoris/{talentId}
     */
    public function toggle(Request $request, $talentId)
    {
        $this->assertClient($request);

        $profil = ProfilTalent::find($talentId);

        if (!$profil) {
            return response()->json(['message' => 'Talent introuvable.'], 404);
        }

        $clientId = $request->user()->id;

        $favori = Favori::where('client_id', $clientId)
            ->where('profil_talent_id', $talentId)
            ->first();

        if ($favori) {
            $favori->delete();
            return response()->json([
                'success' => true,
                'is_favorite' => false,
            ]);
        }

        Favori::create([
            'client_id' => $clientId,
            'profil_talent_id' => $talentId,
        ]);

        return response()->json([
            'success' => true,
            'is_favorite' => true,
        ], 201);
    }
}
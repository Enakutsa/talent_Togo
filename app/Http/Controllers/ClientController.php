<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Construit l'URL affichable d'une photo — compatible URL absolue
     * (Cloudinary, anciennes données) et chemin de stockage local.
     */
    private function resolvePhotoUrl(?string $photo): ?string
    {
        if (!$photo) return null;

        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
            return $photo;
        }

        return asset('storage/' . $photo);
    }

    /**
     * ✅ 3 clients mis en avant sur la page d'accueil (section "Témoignages").
     * On ne renvoie QUE des infos publiques minimales (nom, ville, avatar) —
     * pas d'email, téléphone, etc. Les 3 plus récents clients actifs qui ont
     * une photo de profil renseignée (sans photo, la carte témoignage casse
     * visuellement — voir Home.jsx).
     * GET /api/clients/featured
     */
    public function featured()
    {
        $clients = Utilisateur::where('role', 'client')
            ->where('statut', 'actif')
            ->whereNotNull('photo')
            ->where('photo', '!=', '')
            ->orderByDesc('created_at')
            ->limit(3)
            ->get(['id', 'nom', 'prenom', 'ville', 'photo']);

        return response()->json([
            'success' => true,
            'data'    => $clients->map(fn ($c) => [
                'id'     => $c->id,
                'nom'    => trim($c->prenom . ' ' . $c->nom),
                'ville'  => $c->ville,
                'avatar' => $this->resolvePhotoUrl($c->photo),
            ]),
        ]);
    }
}
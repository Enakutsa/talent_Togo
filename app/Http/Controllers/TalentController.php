<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use Illuminate\Http\Request;

class TalentController extends Controller
{
    /**
     * Construit l'URL affichable d'une photo, qu'elle soit une URL
     * Cloudinary complète (anciennes photos) ou un chemin de stockage
     * local (nouveau comportement par défaut).
     */
    private function resolvePhotoUrl(?string $photo): ?string
    {
        if (!$photo) {
            return null;
        }

        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
            return $photo;
        }

        return asset('storage/' . $photo);
    }

    /**
     * Liste des talents validés.
     * GET /api/talents
     * GET /api/talents?featured=1  -> les mieux notés / les plus récents (limité à 6)
     */
    public function index(Request $request)
    {
        $query = ProfilTalent::query()
            ->whereHas('utilisateur', fn ($q) => $q->where('statut', 'valide'))
            ->with(['utilisateur.categorie', 'portfolios']);

        if ($request->boolean('featured')) {
            $query->orderByDesc('vues')->limit(6);
        }

        $profils = $query->get();

        $data = $profils->map(fn ($profil) => $this->formatTalent($profil));

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Détail d'un talent.
     * GET /api/talents/{id}
     */
    public function show(ProfilTalent $talent)
    {
        $talent->load(['utilisateur.categorie', 'portfolios']);

        abort_unless($talent->utilisateur?->statut === 'valide', 404);

        $talent->increment('vues');

        return response()->json([
            'success' => true,
            'data' => $this->formatTalent($talent),
        ]);
    }

    /**
     * Formate un ProfilTalent dans le shape attendu par TalentCard.jsx
     * (nom, categorie, ville, note, avis, tarif, avatar, portfolio, disponible, competences).
     */
    private function formatTalent(ProfilTalent $profil): array
    {
        $photoUrl = $this->resolvePhotoUrl($profil->photo);

        // Image de couverture = la plus récente réalisation "image" du portfolio.
        $couverture = $profil->portfolios
            ->where('type', 'image')
            ->sortByDesc('created_at')
            ->first();

        $portfolioUrl = $couverture?->media_url ?? $photoUrl;

        return [
            'id' => $profil->id,
            'nom' => trim(($profil->utilisateur->prenom ?? '') . ' ' . ($profil->utilisateur->nom ?? '')),
            'categorie' => $profil->utilisateur->categorie->nom ?? '—',
            'ville' => $profil->utilisateur->ville ?? null,
            'note' => 0,
            'avis' => 0,
            'tarif' => (float) ($profil->tarif_min ?? 0),
            'avatar' => $photoUrl,
            'portfolio' => $portfolioUrl,
            'disponible' => (bool) $profil->disponibilite,
            'competences' => [],
            'verifie' => true,
        ];
    }
}
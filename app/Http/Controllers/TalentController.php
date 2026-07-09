<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use Illuminate\Http\Request;

class TalentController extends Controller
{
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

        // On ne montre pas un profil dont le compte n'est plus "valide"
        // (rejeté, en_attente, désactivé)
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
     *
     * ⚠️ categorie et ville vivent désormais sur Utilisateur, pas ProfilTalent.
     */
    private function formatTalent(ProfilTalent $profil): array
    {
        // ⚠️ asset() génère une URL absolue (http://host:port/storage/...)
        // contrairement à Storage::url() qui renvoie une URL relative,
        // inutilisable quand le frontend tourne sur un port différent (ex: Vite).
        $photoUrl = $profil->photo ? asset('storage/' . $profil->photo) : null;

        // Image de couverture = la plus récente réalisation "image" du portfolio.
        // ⚠️ 'image' et non 'photo' — doit matcher l'enum de la migration Portfolio.
        // Si le talent n'a encore rien publié, on retombe sur sa photo de profil.
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
<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use Illuminate\Http\Request;

class TalentController extends Controller
{
    /**
     * Construit l'URL affichable d'une photo — compatible URL absolue (Cloudinary)
     * et chemin de stockage local.
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
     * Calcule la note moyenne et le total d'avis.
     */
    private function calcNote(ProfilTalent $profil): array
    {
        $avis  = $profil->relationLoaded('avis') ? $profil->avis : $profil->avis()->get();
        $total = $avis->count();
        $note  = $total > 0 ? round($avis->avg('note'), 1) : 0;

        return ['note' => $note, 'total' => $total];
    }

    /**
     * Liste des talents validés.
     * GET /api/talents
     * GET /api/talents?featured=1  → les 3 derniers inscrits validés
     */
    public function index(Request $request)
    {
        $query = ProfilTalent::query()
            ->whereHas('utilisateur', fn ($q) => $q->where('statut', 'valide'))
            ->with(['utilisateur.categorie', 'portfolios']);

        if ($request->boolean('featured')) {
            // ✅ Les 3 derniers talents validés (les plus récents)
            $query->orderByDesc('created_at')->limit(3);
        }

        $profils = $query->get();

        return response()->json([
            'success' => true,
            'data'    => $profils->map(fn ($p) => $this->formatTalentCard($p)),
        ]);
    }

    /**
     * Détail complet d'un talent (biographie + portfolio + avis).
     * GET /api/talents/{id}
     */
    public function show(ProfilTalent $talent)
    {
        $talent->load(['utilisateur.categorie', 'portfolios', 'avis.utilisateur']);

        abort_unless($talent->utilisateur?->statut === 'valide', 404);

        $talent->increment('vues');

        return response()->json([
            'success' => true,
            'data'    => $this->formatTalentDetail($talent),
        ]);
    }

    /**
     * Format léger pour les cartes (listing + accueil).
     */
    private function formatTalentCard(ProfilTalent $profil): array
    {
        $photoUrl = $this->resolvePhotoUrl($profil->photo);

        // Couverture = dernière image du portfolio, sinon la photo de profil
        $couverture = $profil->portfolios
            ->where('type', 'image')
            ->sortByDesc('created_at')
            ->first();

        $portfolioUrl = $couverture
            ? $this->resolvePhotoUrl($couverture->media_url)
            : $photoUrl;

        $noteInfo = $this->calcNote($profil);

        return [
            'id'          => $profil->id,
            'nom'         => trim(($profil->utilisateur->prenom ?? '') . ' ' . ($profil->utilisateur->nom ?? '')),
            'categorie'   => $profil->utilisateur->categorie->nom ?? '—',
            'ville'       => $profil->utilisateur->ville ?? null,
            'note'        => $noteInfo['note'],
            'avis'        => $noteInfo['total'],
            'tarif'       => (float) ($profil->tarif_min ?? 0),
            'tarif_max'   => (float) ($profil->tarif_max ?? 0),
            'avatar'      => $photoUrl,
            'portfolio'   => $portfolioUrl,
            'disponible'  => (bool) $profil->disponibilite,
            'competences' => [],
            'verifie'     => true,
        ];
    }

    /**
     * Format complet pour la page détail.
     */
    private function formatTalentDetail(ProfilTalent $profil): array
    {
        $photoUrl = $this->resolvePhotoUrl($profil->photo);
        $noteInfo = $this->calcNote($profil);

        // Portfolio complet
        $portfolios = $profil->portfolios->map(fn ($p) => [
            'id'    => $p->id,
            'url'   => $this->resolvePhotoUrl($p->media_url),
            'titre' => $p->description ?? '',
            'type'  => $p->type ?? 'image',
        ])->values()->toArray();

        // Avis
        $avisListe = $profil->avis->map(fn ($a) => [
            'id'          => $a->id,
            'client'      => trim(($a->utilisateur->prenom ?? '') . ' ' . ($a->utilisateur->nom ?? '')),
            'avatar'      => null,
            'note'        => $a->note,
            'commentaire' => $a->commentaire,
            'date'        => $a->created_at?->format('d M Y') ?? '',
        ])->values()->toArray();

        return [
            'id'          => $profil->id,
            'nom'         => trim(($profil->utilisateur->prenom ?? '') . ' ' . ($profil->utilisateur->nom ?? '')),
            'categorie'   => $profil->utilisateur->categorie->nom ?? '—',
            'ville'       => $profil->utilisateur->ville ?? null,
            'biographie'  => $profil->biographie,
            'note'        => $noteInfo['note'],
            'avis'        => $noteInfo['total'],
            'tarif'       => (float) ($profil->tarif_min ?? 0),
            'tarif_min'   => (float) ($profil->tarif_min ?? 0),
            'tarif_max'   => (float) ($profil->tarif_max ?? 0),
            'avatar'      => $photoUrl,
            'disponible'  => (bool) $profil->disponibilite,
            'competences' => [],
            'verifie'     => true,
            'portfolios'  => $portfolios,
            'avis_liste'  => $avisListe,
        ];
    }
}
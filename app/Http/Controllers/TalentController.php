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
     * Liste des talents validés, avec filtres optionnels.
     * GET /api/talents
     * GET /api/talents?featured=1                → les 3 derniers inscrits validés
     * GET /api/talents?q=photographe              → recherche texte (nom, catégorie)
     * GET /api/talents?categorie_id=3              → filtre par catégorie
     * GET /api/talents?ville=Lomé                  → filtre par ville
     * GET /api/talents?budget_max=100000            → tarif_min <= budget_max
     * GET /api/talents?disponible=1                 → uniquement les disponibles
     * GET /api/talents?sort=note|prix_asc|prix_desc|recent
     */
    public function index(Request $request)
    {
        $query = ProfilTalent::query()
            ->whereHas('utilisateur', fn ($q) => $q->where('statut', 'valide'))
            // ✅ Un talent validé par l'admin mais qui n'a jamais complété
            // ProfilCreer (pas de photo, pas de tarif fixé) ne doit PAS
            // apparaître dans le listing public, même s'il a un compte
            // "valide" — voir ProfilTalent::estComplet() pour la même
            // logique côté "mon profil".
            ->whereNotNull('photo')
            ->whereNotNull('tarif_min')
            ->with([
                'utilisateur.categorie',
                // ── Uniquement les colonnes nécessaires à l'affichage,
                // au lieu de charger toutes les images/vidéos du
                // portfolio de chaque talent (moins de données
                // transférées depuis Postgres). La sélection de la
                // couverture (dernière image) reste faite en PHP,
                // comme avant, pour ne rien changer au comportement.
                'portfolios:id,profil_talent_id,type,media_url,created_at',
            ])
            // ── Note moyenne et nombre d'avis calculés directement en
            // SQL (agrégation Postgres) au lieu de charger toutes les
            // lignes "avis" de chaque talent et calculer la moyenne en
            // PHP. C'est le changement qui a le plus d'impact ici.
            ->withCount(['avis as avis_count' => fn ($q) => $q->where('statut', 'visible')])
            ->withAvg(['avis as avis_note' => fn ($q) => $q->where('statut', 'visible')], 'note');

        // ── Recherche texte : nom/prénom de l'utilisateur ou nom de catégorie ──
        if ($request->filled('q')) {
            $search = $request->string('q')->trim()->toString();

            $query->where(function ($q) use ($search) {
                $q->whereHas('utilisateur', function ($uq) use ($search) {
                    $uq->where('nom', 'like', "%{$search}%")
                       ->orWhere('prenom', 'like', "%{$search}%");
                })
                ->orWhereHas('utilisateur.categorie', function ($cq) use ($search) {
                    $cq->where('nom', 'like', "%{$search}%");
                });
            });
        }

        // ── Filtre catégorie ──
        if ($request->filled('categorie_id')) {
            $categorieId = $request->input('categorie_id');
            $query->whereHas('utilisateur', function ($q) use ($categorieId) {
                $q->where('categorie_id', $categorieId);
            });
        }

        // ── Filtre ville ──
        if ($request->filled('ville')) {
            $ville = $request->input('ville');
            $query->whereHas('utilisateur', function ($q) use ($ville) {
                $q->where('ville', $ville);
            });
        }

        // ── Filtre budget max (tarif_min du talent <= budget demandé) ──
        if ($request->filled('budget_max')) {
            $query->where('tarif_min', '<=', $request->input('budget_max'));
        }

        // ── Filtre disponibilité ──
        if ($request->boolean('disponible')) {
            $query->where('disponibilite', true);
        }

        // ── Tri ──
        switch ($request->input('sort')) {
            case 'prix_asc':
                $query->orderBy('tarif_min', 'asc');
                break;
            case 'prix_desc':
                $query->orderBy('tarif_min', 'desc');
                break;
            case 'note':
                // ✅ Maintenant possible directement en SQL grâce à
                // withAvg, plus besoin de trier en mémoire après coup.
                $query->orderByDesc('avis_note_avg');
                break;
            case 'recent':
            default:
                $query->orderByDesc('created_at');
                break;
        }

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
        $talent->load(['utilisateur.categorie', 'portfolios', 'avis.client'])
            ->loadCount(['avis as avis_count' => fn ($q) => $q->where('statut', 'visible')])
            ->loadAvg(['avis as avis_note' => fn ($q) => $q->where('statut', 'visible')], 'note');

        // ✅ Même règle que le listing : un talent validé mais dont le
        // profil n'est pas complet (pas de photo/tarif) ne doit pas être
        // consultable, même en accédant directement à son URL.
        abort_unless(
            $talent->utilisateur?->statut === 'valide' && $talent->estComplet(),
            404
        );

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

        return [
            'id'          => $profil->id,
            'nom'         => trim(($profil->utilisateur?->prenom ?? '') . ' ' . ($profil->utilisateur?->nom ?? '')),
            'categorie'   => $profil->utilisateur?->categorie?->nom ?? '—',
            'ville'       => $profil->utilisateur?->ville ?? null,
            'note'        => $profil->avis_note_avg ? round((float) $profil->avis_note_avg, 1) : 0,
            'avis'        => (int) $profil->avis_count,
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

        // Portfolio complet
        $portfolios = $profil->portfolios->map(fn ($p) => [
            'id'    => $p->id,
            'url'   => $this->resolvePhotoUrl($p->media_url),
            'titre' => $p->description ?? '',
            'type'  => $p->type ?? 'image',
        ])->values()->toArray();

        // ✅ Avis — uniquement ceux visibles publiquement, TRIÉS DU PLUS
        // RÉCENT AU PLUS ANCIEN (sortByDesc AVANT le map). Le frontend
        // (DetailTalent.jsx) ne garde ensuite que les 5 premiers de cette
        // liste — donc ce sont bien les 5 derniers avis, mis à jour à
        // chaque nouvel avis.
        $avisListe = $profil->avis
            ->where('statut', 'visible')
            ->sortByDesc('created_at')
            ->map(fn ($a) => [
                'id'          => $a->id,
                'client'      => trim(($a->client?->prenom ?? '') . ' ' . ($a->client?->nom ?? '')),
                'avatar'      => null,
                'note'        => $a->note,
                'commentaire' => $a->commentaire,
                'date'        => $a->created_at?->format('d M Y') ?? '',
            ])
            ->values()
            ->toArray();

        return [
            'id'          => $profil->id,
            'nom'         => trim(($profil->utilisateur?->prenom ?? '') . ' ' . ($profil->utilisateur?->nom ?? '')),
            'categorie'   => $profil->utilisateur?->categorie?->nom ?? '—',
            'ville'       => $profil->utilisateur?->ville ?? null,
            'biographie'  => $profil->biographie,
            'note'        => $profil->avis_note_avg ? round((float) $profil->avis_note_avg, 1) : 0,
            'avis'        => (int) $profil->avis_count,
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
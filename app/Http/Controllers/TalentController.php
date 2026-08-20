<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use App\Models\Abonnement;
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
     * ✅ Condition réutilisée dans index() et show() : la règle de
     * visibilité dépend désormais du plan CHOISI à l'inscription
     * (plan_choisi), pas uniquement de la date abonnement_expire_le :
     *
     * - Talent en plan "gratuit" -> visible tant que son essai n'a pas
     *   expiré (abonnement_expire_le dans le futur, ou null).
     * - Talent en plan "payant" -> visible UNIQUEMENT s'il a un
     *   Abonnement avec statut='actif' ET date_fin dans le futur en
     *   base — c'est-à-dire un paiement réellement confirmé par le
     *   webhook FedaPay. La date abonnement_expire_le (souvent fixée à
     *   +1 mois dès l'inscription, peu importe le plan) ne suffit PAS
     *   à le rendre visible : il doit avoir payé.
     *   Ça permet à un talent "payant" non encore payé de créer son
     *   compte, compléter son profil, accéder au dashboard — mais de
     *   rester invisible des clients tant qu'il n'a pas réglé.
     */
    private function scopeAbonnementActif($query)
    {
        return $query->where(function ($q) {
            $q->where(function ($qGratuit) {
                $qGratuit->where('plan_choisi', 'gratuit')
                    ->where(function ($qDate) {
                        $qDate->whereNull('abonnement_expire_le')
                              ->orWhere('abonnement_expire_le', '>', now());
                    });
            })
            ->orWhere(function ($qPayant) {
                $qPayant->where('plan_choisi', 'payant')
                    ->whereHas('abonnements', function ($qAbo) {
                        $qAbo->where('statut', 'actif')
                             ->where('date_fin', '>', now());
                    });
            });
        });
    }

    /**
     * ✅ Même règle que scopeAbonnementActif, mais appliquée à un
     * utilisateur déjà chargé (utilisé dans show(), où on a l'objet en
     * main plutôt qu'une query builder).
     */
    private function utilisateurEstVisible($utilisateur): bool
    {
        if (!$utilisateur) return false;

        if ($utilisateur->plan_choisi === 'payant') {
            return Abonnement::where('utilisateur_id', $utilisateur->id)
                ->where('statut', 'actif')
                ->where('date_fin', '>', now())
                ->exists();
        }

        // plan_choisi === 'gratuit' (ou valeur historique absente)
        return is_null($utilisateur->abonnement_expire_le)
            || $utilisateur->abonnement_expire_le->isFuture();
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
            ->whereHas('utilisateur', function ($q) {
                $q->where('statut', 'valide');
                // ✅ Masque les talents dont l'essai gratuit a expiré OU
                // dont le plan payant n'a pas (encore) été réglé — voir
                // scopeAbonnementActif() pour le détail de la règle.
                $this->scopeAbonnementActif($q);
            })
            // ✅ Un talent validé par l'admin mais qui n'a jamais complété
            // ProfilCreer (pas de photo, pas de tarif fixé) ne doit PAS
            // apparaître dans le listing public, même s'il a un compte
            // "valide" — voir ProfilTalent::estComplet() pour la même
            // logique côté "mon profil".
            ->whereNotNull('photo')
            ->whereNotNull('tarif_min')
            ->with([
                'utilisateur.categorie',
                'portfolios:id,profil_talent_id,type,media_url,created_at',
            ])
            ->withCount(['avis as avis_count' => fn ($q) => $q->where('statut', 'visible')])
            ->withAvg(['avis as avis_note_avg' => fn ($q) => $q->where('statut', 'visible')], 'note');

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
                $query->orderByDesc('avis_note_avg');
                break;
            case 'recent':
            default:
                $query->orderByDesc('created_at');
                break;
        }

        if ($request->boolean('featured')) {
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
            ->loadAvg(['avis as avis_note_avg' => fn ($q) => $q->where('statut', 'visible')], 'note');

        // ✅ Même règle que le listing : un talent validé mais dont le
        // profil n'est pas complet (pas de photo/tarif), OU dont
        // l'essai gratuit a expiré, OU dont le plan payant n'a pas
        // (encore) été réglé, ne doit pas être consultable — même en
        // accédant directement à son URL.
        abort_unless(
            $talent->utilisateur?->statut === 'valide'
                && $talent->estComplet()
                && $this->utilisateurEstVisible($talent->utilisateur),
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

        $portfolios = $profil->portfolios->map(fn ($p) => [
            'id'    => $p->id,
            'url'   => $this->resolvePhotoUrl($p->media_url),
            'titre' => $p->description ?? '',
            'type'  => $p->type ?? 'image',
        ])->values()->toArray();

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
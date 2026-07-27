<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Cache;

class CategorieController extends Controller
{
    /**
     * Liste des catégories, pour peupler le <select> à l'inscription
     * et afficher le nombre de talents validés par catégorie sur la
     * page de recherche.
     * GET /api/categories
     */
    public function index()
    {
        $categories = Cache::remember('categories.index', now()->addMinutes(15), function () {

            $categories = Categorie::query()->orderBy('nom')->get();

            // ── Une seule requête groupée pour compter les talents
            // validés par catégorie, au lieu d'une requête COUNT par
            // catégorie (N+1). Ex: 10 catégories -> 1 requête au lieu
            // de 10. Résultat indexé par categorie_id pour un accès
            // instantané en mémoire ci-dessous.
            $counts = Utilisateur::where('role', 'talent')
                ->where('statut', 'valide')
                ->whereNotNull('categorie_id')
                ->selectRaw('categorie_id, COUNT(*) as total')
                ->groupBy('categorie_id')
                ->pluck('total', 'categorie_id');

            return $categories->map(fn ($cat) => [
                'id'    => $cat->id,
                'nom'   => $cat->nom,
                'label' => $cat->nom,
                'count' => (int) ($counts[$cat->id] ?? 0),
            ]);
        });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
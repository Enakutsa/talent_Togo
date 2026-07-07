<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Utilisateur;

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
        $categories = Categorie::query()
            ->orderBy('nom')
            ->get()
            ->map(function ($cat) {
                // ⚠️ categorie_id et statut vivent maintenant sur Utilisateur,
                // pas ProfilTalent : on compte directement dessus plutôt que
                // de dépendre d'une relation Categorie -> ProfilTalent.
                $count = Utilisateur::where('categorie_id', $cat->id)
                    ->where('role', 'talent')
                    ->where('statut', 'valide')
                    ->count();

                return [
                    'id' => $cat->id,
                    'nom' => $cat->nom,
                    'label' => $cat->nom,
                    'count' => $count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
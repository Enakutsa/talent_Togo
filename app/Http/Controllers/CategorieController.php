<?php

namespace App\Http\Controllers;

use App\Models\Categorie;

class CategorieController extends Controller
{
    public function index()
    {
        $categories = Categorie::query()
            ->withCount(['profils' => function ($query) {
                $query->where('statut', 'valide');
            }])
            ->get()
            ->map(function ($cat) {
                return [
                    'id' => $cat->id,
                    'nom' => $cat->nom,
                    'label' => $cat->nom,
                    'count' => $cat->profils_count,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
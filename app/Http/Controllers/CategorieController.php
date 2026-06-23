<?php

namespace App\Http\Controllers;

use App\Models\Categorie;

class CategorieController extends Controller
{
    public function index()
    {
        $categories = Categorie::all();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}
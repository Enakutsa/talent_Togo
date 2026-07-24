<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;

class CategorieSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Photographe',
            'Graphiste',
            'Couturier / Couturière',
            'Coiffeur / Coiffeuse',
            'Maquilleur / Maquilleuse',
            'Développeur',
            'Décorateur événementiel',
            'Musicien / DJ',
            'Vidéaste',
            'Autre',
        ];

        foreach ($categories as $nom) {
            Categorie::firstOrCreate(['nom' => $nom]);
        }
    }
}
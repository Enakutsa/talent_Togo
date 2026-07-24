<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Utilisateur::firstOrCreate(
            ['email' => 'enakutsakokouespoir@gmail.com'],
            [
                'nom' => 'Enakutsa',
                'prenom' => 'Kokou Espoir',
                'mot_de_passe' => Hash::make('Es1@2002'),
                'role' => 'admin',
                'is_verified' => true,
                'statut' => 'valide',
            ]
        );
    }
}
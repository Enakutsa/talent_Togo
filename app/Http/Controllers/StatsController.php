<?php

namespace App\Http\Controllers;

use App\Models\ProfilTalent;
use App\Models\Utilisateur;

class StatsController extends Controller
{
    public function index()
    {
        $talents = Utilisateur::where('role', 'talent')->count();
        $clients = Utilisateur::where('role', 'client')->count();
        $villes = ProfilTalent::where('statut', 'valide')->distinct('ville')->count('ville');

        // Adaptez selon votre table de prestations/demandes si disponible
        $prestations = class_exists(\App\Models\DemandePrestation::class)
            ? \App\Models\DemandePrestation::count()
            : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'talents' => $this->formatCount($talents),
                'clients' => $this->formatCount($clients),
                'prestations' => $this->formatCount($prestations),
                'villes' => (string) $villes,
            ],
        ]);
    }

    /**
     * Formate un nombre en affichage compact avec un "+" si > 0
     * (ex: 12 -> "12+", 1200 -> "1 200+").
     */
    private function formatCount(int $value): string
    {
        if ($value === 0) {
            return '0';
        }

        return number_format($value, 0, ',', ' ') . '+';
    }
}
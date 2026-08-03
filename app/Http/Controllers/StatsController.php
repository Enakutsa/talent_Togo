<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    public function index()
    {
        // Mis en cache 15 minutes : ce sont des statistiques "vitrine"
        // affichées sur la home, elles n'ont pas besoin d'être calculées
        // à chaque visite. Ça évite de retaper la base à chaque chargement
        // de page, ce qui était la principale cause de lenteur ici.
        $data = Cache::remember('stats.home', now()->addMinutes(15), function () {

            // Une seule requête au lieu de 3 pour talents/clients/villes
            // -> moins d'allers-retours réseau vers la base Postgres.
            $row = Utilisateur::selectRaw("
                COUNT(*) FILTER (WHERE role = 'talent') as talents,
                COUNT(*) FILTER (WHERE role = 'client') as clients,
                COUNT(DISTINCT ville) FILTER (WHERE role = 'talent' AND statut = 'valide' AND ville IS NOT NULL) as villes
            ")->first();

            $prestations = class_exists(\App\Models\DemandePrestation::class)
                ? \App\Models\DemandePrestation::count()
                : 0;

            return [
                'talents' => $this->formatCount((int) $row->talents),
                'clients' => $this->formatCount((int) $row->clients),
                'prestations' => $this->formatCount($prestations),
                'villes' => (string) $row->villes,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Formate un nombre avec séparateur de milliers (ex: 1200 -> "1 200"),
     * sans "+", pour afficher le chiffre exact sur la page d'accueil.
     */
    private function formatCount(int $value): string
    {
        return number_format($value, 0, ',', ' ');
    }
}
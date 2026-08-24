<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Support\Facades\Cache;

class StatsController extends Controller
{
    public function index()
    {
        // ✅ Cache réduit à 20 secondes (au lieu de 15 minutes) : garde
        // l'intérêt d'éviter de retaper la base à chaque chargement de
        // page en cas de trafic rapproché, tout en gardant les chiffres
        // affichés quasi à jour après une inscription ou une action —
        // un décalage de 20s max est imperceptible pour un visiteur.
        $data = Cache::remember('stats.home', now()->addSeconds(20), function () {

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
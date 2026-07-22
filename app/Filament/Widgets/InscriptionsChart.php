<?php

namespace App\Filament\Widgets;

use App\Models\Utilisateur;
use Filament\Widgets\ChartWidget;

class InscriptionsChart extends ChartWidget
{
    protected ?string $heading = 'Inscriptions (30 derniers jours)';

    protected function getData(): array
    {
        $debut = now()->subDays(29)->startOfDay();

        // ✅ Une seule requête groupée par (jour, rôle) plutôt que 60
        // requêtes (30 jours x 2 rôles) dans une boucle.
        $rows = Utilisateur::selectRaw("DATE(created_at) as jour, role, COUNT(*) as total")
            ->where('created_at', '>=', $debut)
            ->whereIn('role', ['talent', 'client'])
            ->groupBy('jour', 'role')
            ->get();

        $labels = [];
        $talents = [];
        $clients = [];

        for ($i = 0; $i < 30; $i++) {
            $date = $debut->copy()->addDays($i);
            $jourStr = $date->format('Y-m-d');
            $labels[] = $date->format('d/m');

            $talents[] = (int) $rows->firstWhere(fn ($r) => $r->jour === $jourStr && $r->role === 'talent')?->total ?? 0;
            $clients[] = (int) $rows->firstWhere(fn ($r) => $r->jour === $jourStr && $r->role === 'client')?->total ?? 0;
        }

        return [
            'datasets' => [
                [
                    'label' => 'Talents',
                    'data' => $talents,
                    'borderColor' => '#166534',
                    'backgroundColor' => 'rgba(22, 101, 52, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
                [
                    'label' => 'Clients',
                    'data' => $clients,
                    'borderColor' => '#ea580c',
                    'backgroundColor' => 'rgba(234, 88, 12, 0.1)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
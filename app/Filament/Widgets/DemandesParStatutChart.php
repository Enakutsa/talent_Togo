<?php

namespace App\Filament\Widgets;

use App\Models\DemandePrestation;
use Filament\Widgets\ChartWidget;

class DemandesParStatutChart extends ChartWidget
{
    protected ?string $heading = 'Demandes par statut';

    protected int|string|array $columnSpan = 1;

    protected function getData(): array
    {
        $statuts = [
            'en_attente',
            'acceptee',
            'refusee',
            'terminee',
        ];

        $counts = DemandePrestation::query()
            ->whereIn('statut', $statuts)
            ->selectRaw('statut, COUNT(*) as total')
            ->groupBy('statut')
            ->pluck('total', 'statut');

        return [
            'datasets' => [
                [
                    'data' => [
                        $counts->get('en_attente', 0),
                        $counts->get('acceptee', 0),
                        $counts->get('refusee', 0),
                        $counts->get('terminee', 0),
                    ],
                    'backgroundColor' => [
                        '#f59e0b',
                        '#16a34a',
                        '#dc2626',
                        '#2563eb',
                    ],
                    'borderWidth' => 0,
                ],
            ],
            'labels' => [
                'En attente',
                'Acceptées',
                'Refusées',
                'Terminées',
            ],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
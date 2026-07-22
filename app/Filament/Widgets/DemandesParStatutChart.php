<?php

namespace App\Filament\Widgets;

use App\Models\DemandePrestation;
use Filament\Widgets\ChartWidget;

class DemandesParStatutChart extends ChartWidget
{
    protected ?string $heading = 'Demandes par statut';

    // ✅ 'conversation' exclu volontairement : ce n'est pas un vrai statut
    // de demande de prestation, juste un conteneur technique pour les fils
    // de messagerie démarrés sans demande formelle (voir MessageController).
    protected function getData(): array
    {
        $statuts = ['en_attente', 'acceptee', 'refusee', 'terminee'];

        $counts = DemandePrestation::whereIn('statut', $statuts)
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
                        '#f59e0b', // en_attente - orange/jaune
                        '#166534', // acceptee - vert
                        '#dc2626', // refusee - rouge
                        '#2563eb', // terminee - bleu
                    ],
                ],
            ],
            'labels' => ['En attente', 'Acceptées', 'Refusées', 'Terminées'],
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
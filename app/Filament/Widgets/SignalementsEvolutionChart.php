<?php

namespace App\Filament\Widgets;

use App\Models\Signalement;
use Filament\Widgets\ChartWidget;

class SignalementsEvolutionChart extends ChartWidget
{
    protected ?string $heading = 'Signalements (30 derniers jours)';

    protected int|string|array $columnSpan = 1;

    protected ?string $maxHeight = '300px';

    protected function getData(): array
    {
        $debut = now()->subDays(29)->startOfDay();

        $rows = Signalement::query()
            ->selectRaw('DATE(created_at) as jour, COUNT(*) as total')
            ->where('created_at', '>=', $debut)
            ->groupBy('jour')
            ->pluck('total', 'jour');

        $labels = [];
        $data = [];

        for ($i = 0; $i < 30; $i++) {
            $date = $debut->copy()->addDays($i);

            $labels[] = $date->format('d/m');

            $data[] = (int) ($rows->get($date->format('Y-m-d')) ?? 0);
        }

        return [
            'datasets' => [
                [
                    'label' => 'Signalements',
                    'data' => $data,
                    'borderColor' => '#dc2626',
                    'backgroundColor' => 'rgba(220, 38, 38, 0.10)',
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
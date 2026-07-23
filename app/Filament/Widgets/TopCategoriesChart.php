<?php

namespace App\Filament\Widgets;

use App\Models\Categorie;
use App\Models\Utilisateur;
use Filament\Widgets\ChartWidget;

class TopCategoriesChart extends ChartWidget
{
    protected ?string $heading = 'Talents par catégorie';

    protected int|string|array $columnSpan = 1;

    protected function getData(): array
    {
        $rows = Utilisateur::query()
            ->selectRaw('categorie_id, COUNT(*) as total')
            ->where('role', 'talent')
            ->where('statut', 'valide')
            ->whereNotNull('categorie_id')
            ->groupBy('categorie_id')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        $categorieNoms = Categorie::query()
            ->whereIn('id', $rows->pluck('categorie_id'))
            ->pluck('nom', 'id');

        return [
            'datasets' => [
                [
                    'label' => 'Talents',
                    'data' => $rows->pluck('total')->toArray(),
                    'backgroundColor' => '#166534',
                    'borderRadius' => 6,
                ],
            ],
            'labels' => $rows
                ->map(fn ($row) => $categorieNoms->get($row->categorie_id, '—'))
                ->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
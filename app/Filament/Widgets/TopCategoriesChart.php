<?php

namespace App\Filament\Widgets;

use App\Models\Categorie;
use App\Models\Utilisateur;
use Filament\Widgets\ChartWidget;

class TopCategoriesChart extends ChartWidget
{
    protected ?string $heading = 'Talents par catégorie';

    protected function getData(): array
    {
        // ✅ Part de la table utilisateurs (qui porte categorie_id) plutôt
        // que d'une relation Categorie::utilisateurs() qui n'existe pas —
        // pas besoin de toucher au modèle Categorie pour ce widget.
        $rows = Utilisateur::selectRaw('categorie_id, COUNT(*) as total')
            ->where('role', 'talent')
            ->where('statut', 'valide')
            ->whereNotNull('categorie_id')
            ->groupBy('categorie_id')
            ->orderByDesc('total')
            ->limit(8)
            ->get();

        $categorieNoms = Categorie::whereIn('id', $rows->pluck('categorie_id'))
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
            'labels' => $rows->map(fn ($r) => $categorieNoms->get($r->categorie_id, '—'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
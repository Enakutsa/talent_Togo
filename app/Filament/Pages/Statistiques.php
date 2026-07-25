<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\DemandesParStatutChart;
use App\Filament\Widgets\InscriptionsChart;
use App\Filament\Widgets\SignalementsEvolutionChart;
use App\Filament\Widgets\TopCategoriesChart;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class Statistiques extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static ?string $navigationLabel = 'Statistiques';

    protected static ?string $title = 'Statistiques';

    protected static ?int $navigationSort = 2;

    protected static ?string $slug = 'statistiques';

    protected string $view = 'filament.pages.statistiques';

    public function getWidgets(): array
    {
        return [
            InscriptionsChart::class,
            DemandesParStatutChart::class,
            TopCategoriesChart::class,
            SignalementsEvolutionChart::class,
        ];
    }

    public function getColumns(): int|array
    {
        return 2;
    }
}
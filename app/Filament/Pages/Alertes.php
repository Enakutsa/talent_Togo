<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\AvisNegatifsNonTraites;
use App\Filament\Widgets\ComptesDesactivesRecents;
use App\Filament\Widgets\DerniersSignalements;
use App\Filament\Widgets\TalentsInactifs;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Icons\Heroicon;

class Alertes extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedExclamationTriangle;

    protected static ?string $navigationLabel = 'Alertes';

    protected static ?string $title = 'Alertes';

    protected static ?int $navigationSort = 3;

    protected static ?string $slug = 'alertes';

    protected function getHeaderWidgets(): array
    {
        return [
            DerniersSignalements::class,
            AvisNegatifsNonTraites::class,
            ComptesDesactivesRecents::class,
            TalentsInactifs::class,
        ];
    }

    public function getHeaderWidgetsColumns(): int|array
    {
        return 2;
    }
}
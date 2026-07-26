<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\DerniersTalentsEnAttente;
use App\Filament\Widgets\StatsOverview;
use App\Filament\Widgets\TopTalentsNotes;
use App\Filament\Widgets\WelcomeWidget;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    // ✅ On ignore volontairement le pool global de widgets découverts
    // (Filament::getWidgets()) et on retourne une liste fixe et curatée —
    // c'est ce qui empêche le "vrac" de revenir sur le tableau de bord
    // principal, même avec discoverWidgets() actif dans le provider
    // (nécessaire pour que les widgets des pages Statistiques/Alertes
    // fonctionnent correctement).
    public function getWidgets(): array
    {
        return [
            WelcomeWidget::class,
            StatsOverview::class,
            DerniersTalentsEnAttente::class,
            TopTalentsNotes::class,
        ];
    }
}
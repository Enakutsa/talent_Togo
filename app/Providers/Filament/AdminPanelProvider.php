<?php

namespace App\Providers\Filament;

use App\Filament\Widgets\DernieresDemandes;
use App\Filament\Widgets\DerniersTalentsEnAttente;
use App\Filament\Widgets\StatsOverview;
use App\Filament\Widgets\TopTalentsNotes;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::Amber,
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            // ✅ Les nouvelles pages "Statistiques" et "Alertes" (dans
            // app/Filament/Pages) sont découvertes automatiquement ici,
            // pas besoin de les ajouter manuellement dans ->pages().
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            // ✅ IMPORTANT : plus de ->discoverWidgets() ici. Cette méthode
            // attachait automatiquement TOUS les widgets du dossier
            // Filament/Widgets au tableau de bord principal, ce qui créait
            // le fouillis initial. Désormais, seuls les widgets listés
            // ci-dessous apparaissent sur le tableau de bord principal —
            // les autres sont déclarés directement dans les pages
            // Statistiques.php et Alertes.php (voir app/Filament/Pages).
            ->widgets([
                AccountWidget::class,
                FilamentInfoWidget::class,
                StatsOverview::class,
                DerniersTalentsEnAttente::class,
                DernieresDemandes::class,
                TopTalentsNotes::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
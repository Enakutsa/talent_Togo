<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Utilisateurs\UtilisateurResource;
use App\Filament\Resources\Signalements\SignalementResource;
use App\Models\DemandePrestation;
use App\Models\Signalement;
use App\Models\Utilisateur;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        $talentsEnAttente = Utilisateur::where('role', 'talent')
            ->where('statut', 'en_attente')
            ->count();

        $signalementsOuverts = Signalement::where('statut', 'en_attente')->count();

        $utilisateursActifs = Utilisateur::where('role', '!=', 'admin')
            ->where(function ($q) {
                $q->where('statut', 'actif')
                  ->orWhere('statut', 'valide');
            })
            ->count();

        $demandesEnCours = DemandePrestation::whereIn('statut', ['en_attente', 'acceptee'])->count();

        return [
            Stat::make('Talents en attente', $talentsEnAttente)
                ->description('Validation requise')
                ->descriptionIcon('heroicon-m-clock')
                ->color($talentsEnAttente > 0 ? 'warning' : 'success')
                ->url(UtilisateurResource::getUrl('index')),

            Stat::make('Signalements ouverts', $signalementsOuverts)
                ->description('À traiter')
                ->descriptionIcon('heroicon-m-flag')
                ->color($signalementsOuverts > 0 ? 'danger' : 'success')
                ->url(SignalementResource::getUrl('index')),

            Stat::make('Utilisateurs actifs', $utilisateursActifs)
                ->description('Clients + talents validés')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary')
                ->url(UtilisateurResource::getUrl('index')),

            Stat::make('Demandes en cours', $demandesEnCours)
                ->description('En attente ou acceptées')
                ->descriptionIcon('heroicon-m-clipboard-document-list')
                ->color('info'),
        ];
    }
}
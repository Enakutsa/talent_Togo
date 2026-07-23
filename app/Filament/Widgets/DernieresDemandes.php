<?php

namespace App\Filament\Widgets;

use App\Models\DemandePrestation;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class DernieresDemandes extends BaseWidget
{
    protected static ?string $heading = 'Dernières demandes';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                DemandePrestation::query()
                    ->with(['client', 'profilTalent.utilisateur'])
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('client_nom')
                    ->label('Client')
                    ->getStateUsing(fn (DemandePrestation $record) => trim(
                        ($record->client?->prenom ?? '') . ' ' . ($record->client?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('talent_nom')
                    ->label('Talent')
                    ->getStateUsing(fn (DemandePrestation $record) => trim(
                        ($record->profilTalent?->utilisateur?->prenom ?? '') . ' ' .
                        ($record->profilTalent?->utilisateur?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('statut')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'en_attente' => 'warning',
                        'acceptee' => 'success',
                        'refusee' => 'danger',
                        'terminee' => 'info',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('budget')
                    ->label('Budget')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 0, ',', ' ') . ' FCFA' : '—'),
            ])
            ->paginated(false);
    }
}
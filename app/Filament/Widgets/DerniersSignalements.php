<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Signalements\SignalementResource;
use App\Models\Signalement;
use Filament\Actions\Action;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class DerniersSignalements extends BaseWidget
{
    protected static ?string $heading = 'Derniers signalements';

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Signalement::query()
                    ->with(['profilTalent.utilisateur'])
                    ->latest()
            )
            ->columns([
                Tables\Columns\TextColumn::make('motif')
                    ->label('Motif')
                    ->badge()
                    ->color('danger'),

                Tables\Columns\TextColumn::make('talent_vise')
                    ->label('Talent visé')
                    ->state(fn (Signalement $record) => trim(
                        ($record->profilTalent?->utilisateur?->prenom ?? '') . ' ' .
                        ($record->profilTalent?->utilisateur?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('statut')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'en_attente' => 'warning',
                        'traite' => 'success',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Signalé le')
                    ->since(),
            ])
            ->actions([
                Action::make('voir')
                    ->label('Voir')
                    ->icon('heroicon-m-eye')
                    ->url(fn (Signalement $record) => SignalementResource::getUrl(
                        'edit',
                        ['record' => $record]
                    )),
            ])
            ->defaultPaginationPageOption(5);
    }
}
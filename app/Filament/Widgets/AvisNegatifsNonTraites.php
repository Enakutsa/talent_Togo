<?php

namespace App\Filament\Widgets;

use App\Models\Avis;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class AvisNegatifsNonTraites extends BaseWidget
{
    protected static ?string $heading = 'Avis négatifs à surveiller';

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Avis::query()
                    ->with([
                        'client',
                        'profilTalent.utilisateur',
                    ])
                    ->where('note', '<=', 2)
                    ->where('statut', 'visible')
                    ->latest()
            )
            ->columns([
                Tables\Columns\TextColumn::make('client_nom')
                    ->label('Client')
                    ->state(fn (Avis $record) => trim(
                        ($record->client?->prenom ?? '') . ' ' .
                        ($record->client?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('talent_nom')
                    ->label('Talent visé')
                    ->state(fn (Avis $record) => trim(
                        ($record->profilTalent?->utilisateur?->prenom ?? '') . ' ' .
                        ($record->profilTalent?->utilisateur?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('note')
                    ->label('Note')
                    ->badge()
                    ->color('danger')
                    ->formatStateUsing(fn ($state) => "{$state} ★"),

                Tables\Columns\TextColumn::make('commentaire')
                    ->label('Commentaire')
                    ->limit(50)
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Posté')
                    ->date('d/m/Y'),
            ])
            ->defaultPaginationPageOption(5);
    }
}
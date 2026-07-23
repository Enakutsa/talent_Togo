<?php

namespace App\Filament\Widgets;

use App\Models\Avis;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class AvisNegatifsNonTraites extends BaseWidget
{
    protected static ?string $heading = 'Avis négatifs à surveiller';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                // ✅ "Non traités" = avis note ≤ 2 toujours en statut
                // "visible" (donc affichés publiquement sans qu'un admin
                // n'ait encore agi dessus — les masquer serait le signe
                // d'un traitement déjà effectué).
                Avis::query()
                    ->with(['client', 'profilTalent.utilisateur'])
                    ->where('note', '<=', 2)
                    ->where('statut', 'visible')
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('client_nom')
                    ->label('Client')
                    ->getStateUsing(fn (Avis $record) => trim(
                        ($record->client?->prenom ?? '') . ' ' . ($record->client?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('talent_nom')
                    ->label('Talent visé')
                    ->getStateUsing(fn (Avis $record) => trim(
                        ($record->profilTalent?->utilisateur?->prenom ?? '') . ' ' .
                        ($record->profilTalent?->utilisateur?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('note')
                    ->label('Note')
                    ->formatStateUsing(fn ($state) => $state . ' ★')
                    ->color('danger')
                    ->badge(),

                Tables\Columns\TextColumn::make('commentaire')
                    ->label('Commentaire')
                    ->limit(50)
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Posté')
                    ->date('d M Y'),
            ])
            ->paginated(false);
    }
}
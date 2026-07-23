<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Utilisateurs\UtilisateurResource;
use App\Models\Utilisateur;
use Filament\Actions\Action;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class ComptesDesactivesRecents extends BaseWidget
{
    protected static ?string $heading = 'Comptes désactivés récemment';

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Utilisateur::query()
                    ->where('statut', 'desactive')
                    ->latest('updated_at')
            )
            ->columns([
                Tables\Columns\TextColumn::make('nom_complet')
                    ->label('Utilisateur')
                    ->state(fn (Utilisateur $record) => trim(
                        $record->prenom . ' ' . $record->nom
                    )),

                Tables\Columns\TextColumn::make('role')
                    ->label('Rôle')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'talent' => 'info',
                        'admin' => 'danger',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('motif_rejet')
                    ->label('Motif')
                    ->placeholder('Non précisé')
                    ->limit(40),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Désactivé')
                    ->since(),
            ])
            ->actions([
                Action::make('voir')
                    ->label('Voir')
                    ->icon('heroicon-m-eye')
                    ->url(
                        fn (Utilisateur $record) =>
                        UtilisateurResource::getUrl('edit', [
                            'record' => $record,
                        ])
                    ),
            ])
            ->defaultPaginationPageOption(5);
    }
}
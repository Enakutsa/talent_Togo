<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Utilisateurs\UtilisateurResource;
use App\Models\Utilisateur;
use Filament\Actions\Action;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class DerniersTalentsEnAttente extends BaseWidget
{
    protected static ?string $heading = 'Talents en attente';

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Utilisateur::query()
                    ->where('role', 'talent')
                    ->where('statut', 'en_attente')
                    ->with('categorie')
                    ->latest()
            )
            ->columns([
                Tables\Columns\TextColumn::make('nom_complet')
                    ->label('Nom')
                    ->state(fn (Utilisateur $record) => trim(
                        $record->prenom . ' ' . $record->nom
                    )),

                Tables\Columns\TextColumn::make('categorie.nom')
                    ->label('Catégorie')
                    ->badge()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('ville')
                    ->label('Ville')
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Inscrit')
                    ->since(),
            ])
            ->actions([
                Action::make('voir')
                    ->label('Voir')
                    ->icon('heroicon-m-eye')
                    ->url(fn (Utilisateur $record) => UtilisateurResource::getUrl(
                        'edit',
                        ['record' => $record]
                    )),
            ])
            ->defaultPaginationPageOption(5);
    }
}
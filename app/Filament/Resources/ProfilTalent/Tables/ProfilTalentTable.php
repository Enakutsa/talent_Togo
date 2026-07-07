<?php

namespace App\Filament\Resources\ProfilTalent\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProfilTalentTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('photo')
                    ->label('Photo')
                    ->disk('public')
                    ->circular()
                    ->defaultImageUrl(asset('images/avatar-placeholder.png')),

                TextColumn::make('utilisateur.nom')
                    ->label('Nom')
                    ->formatStateUsing(fn ($record) => trim($record->utilisateur->prenom . ' ' . $record->utilisateur->nom))
                    ->searchable(['nom', 'prenom'])
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('utilisateur.email')
                    ->label('E-mail')
                    ->searchable()
                    ->icon('heroicon-o-envelope')
                    ->copyable(),

                TextColumn::make('utilisateur.telephone')
                    ->label('Téléphone')
                    ->searchable()
                    ->icon('heroicon-o-phone')
                    ->copyable(),

                // ℹ️ Lecture seule : le statut appartient maintenant à Utilisateur.
                // Les actions Valider/Rejeter/Activer/Désactiver se font depuis la
                // resource "Utilisateurs", pas ici.
                TextColumn::make('utilisateur.statut')
                    ->label('Statut du compte')
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'valide', 'actif' => 'success',
                        'en_attente' => 'warning',
                        'rejete' => 'danger',
                        'desactive' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'valide' => 'Validé',
                        'actif' => 'Actif',
                        'en_attente' => 'En attente',
                        'rejete' => 'Rejeté',
                        'desactive' => 'Désactivé',
                        default => $state ?? '—',
                    })
                    ->sortable(),

                TextColumn::make('categorie.nom')
                    ->label('Catégorie')
                    ->badge()
                    ->color('gray')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('ville')
                    ->searchable()
                    ->icon('heroicon-o-map-pin'),

                TextColumn::make('tarif_min')
                    ->label('Tarifs')
                    ->formatStateUsing(fn ($record) => $record->tarif_min || $record->tarif_max
                        ? number_format($record->tarif_min ?? 0, 0, ',', ' ') . ' - ' . number_format($record->tarif_max ?? 0, 0, ',', ' ') . ' FCFA'
                        : '—')
                    ->sortable(),

                IconColumn::make('disponibilite')
                    ->label('Dispo')
                    ->boolean(),

                TextColumn::make('biographie')
                    ->label('Biographie')
                    ->limit(50)
                    ->toggleable(isToggledHiddenByDefault: true)
                    ->placeholder('—'),

                TextColumn::make('vues')
                    ->numeric()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Inscrit le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('utilisateur.statut')
                    ->label('Statut du compte')
                    ->relationship('utilisateur', 'statut')
                    ->options([
                        'en_attente' => 'En attente',
                        'valide' => 'Validé',
                        'rejete' => 'Rejeté',
                        'desactive' => 'Désactivé',
                    ]),

                SelectFilter::make('categorie_id')
                    ->label('Catégorie')
                    ->relationship('categorie', 'nom'),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
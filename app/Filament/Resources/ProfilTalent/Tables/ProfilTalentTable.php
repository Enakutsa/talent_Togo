<?php

namespace App\Filament\Resources\ProfilTalent\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;

class ProfilTalentTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('photo')
                    ->label('Photo')
                    ->circular()
                    ->getStateUsing(function ($record) {
                        $photo = $record->photo;

                        if (! $photo) {
                            return null;
                        }

                        // Si le chemin est déjà une URL absolue (Cloudinary, S3...),
                        // on l'utilise telle quelle. Sinon on résout via le disque
                        // "public" pour les fichiers en stockage local.
                        if (str_starts_with($photo, 'http://') || str_starts_with($photo, 'https://')) {
                            return $photo;
                        }

                        return Storage::disk('public')->url($photo);
                    })
                    ->defaultImageUrl(asset('images/avatar-placeholder.png')),

                TextColumn::make('biographie')
                    ->label('Biographie')
                    ->limit(60)
                    ->placeholder('—'),

                TextColumn::make('tarif_min')
                    ->label('Tarif min.')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 0, ',', ' ') . ' FCFA' : '—')
                    ->sortable(),

                TextColumn::make('tarif_max')
                    ->label('Tarif max.')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 0, ',', ' ') . ' FCFA' : '—')
                    ->sortable(),

                IconColumn::make('disponibilite')
                    ->label('Dispo')
                    ->boolean(),

                TextColumn::make('vues')
                    ->numeric()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('created_at')
                    ->label('Créé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
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
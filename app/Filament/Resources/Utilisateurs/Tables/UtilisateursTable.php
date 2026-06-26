<?php

namespace App\Filament\Resources\Utilisateurs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class UtilisateursTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nom')
                    ->searchable()
                    ->sortable()
                    ->weight('semibold'),

                TextColumn::make('prenom')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('email')
                    ->label('E-mail')
                    ->searchable()
                    ->icon('heroicon-o-envelope')
                    ->copyable(),

                TextColumn::make('telephone')
                    ->label('Téléphone')
                    ->searchable()
                    ->icon('heroicon-o-phone')
                    ->copyable()
                    ->placeholder('—'),

                TextColumn::make('role')
                    ->label('Rôle')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'admin' => 'danger',
                        'talent' => 'warning',
                        'client' => 'success',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'admin' => 'Administrateur',
                        'talent' => 'Talent',
                        'client' => 'Client',
                        default => $state,
                    })
                    ->searchable()
                    ->sortable(),

                IconColumn::make('is_verified')
                    ->label('Vérifié')
                    ->boolean(),

                TextColumn::make('created_at')
                    ->label('Inscrit le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Mis à jour le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('role')
                    ->label('Rôle')
                    ->options([
                        'admin' => 'Administrateur',
                        'talent' => 'Talent',
                        'client' => 'Client',
                    ]),
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
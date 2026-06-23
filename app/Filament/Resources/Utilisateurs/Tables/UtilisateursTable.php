<?php

namespace App\Filament\Resources\Utilisateurs\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Actions\Action;
use Filament\Tables\Table;

class UtilisateursTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nom')
                    ->searchable(),

                TextColumn::make('prenom')
                    ->searchable(),

                TextColumn::make('email')
                    ->label('Email address')
                    ->searchable(),

                TextColumn::make('role')
                    ->searchable(),

                // ✅ AJOUT VALIDATION
                IconColumn::make('is_validated')
                    ->label('Validé')
                    ->boolean(),

                // ✅ AJOUT REJET
                IconColumn::make('is_rejected')
                    ->label('Rejeté')
                    ->boolean(),

                IconColumn::make('is_verified')
                    ->boolean(),

                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])

            ->filters([
                //
            ])

            ->recordActions([

                EditAction::make(),

                // ✅ BOUTON VALIDER
                Action::make('valider')
                    ->label('Valider')
                    ->color('success')
                    ->icon('heroicon-o-check')
                    ->visible(fn ($record) =>
                        $record->role === 'talent' &&
                        !$record->is_validated &&
                        !$record->is_rejected
                    )
                    ->action(function ($record) {
                        $record->update([
                            'is_validated' => true,
                            'is_rejected' => false,
                        ]);
                    }),

                // ❌ BOUTON REJETER
                Action::make('rejeter')
                    ->label('Rejeter')
                    ->color('danger')
                    ->icon('heroicon-o-x-mark')
                    ->visible(fn ($record) =>
                        $record->role === 'talent' &&
                        !$record->is_rejected &&
                        !$record->is_validated
                    )
                    ->action(function ($record) {
                        $record->update([
                            'is_validated' => false,
                            'is_rejected' => true,
                        ]);
                    }),

            ])

            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
<?php

namespace App\Filament\Widgets;

use App\Filament\Resources\Utilisateurs\UtilisateurResource;
use App\Models\ProfilTalent;
use Filament\Actions\Action;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TalentsInactifs extends BaseWidget
{
    protected static ?string $heading = 'Talents inactifs depuis longtemps';

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                ProfilTalent::query()
                    ->with('utilisateur.categorie')
                    ->where('disponibilite', false)
                    ->where('updated_at', '<=', now()->subDays(30))
                    ->oldest('updated_at')
            )
            ->columns([
                Tables\Columns\TextColumn::make('nom_complet')
                    ->label('Talent')
                    ->state(fn (ProfilTalent $record) => trim(
                        ($record->utilisateur?->prenom ?? '') . ' ' .
                        ($record->utilisateur?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('utilisateur.categorie.nom')
                    ->label('Catégorie')
                    ->badge()
                    ->placeholder('—'),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Indisponible depuis')
                    ->since(),
            ])
            ->actions([
                Action::make('voir')
                    ->label('Voir')
                    ->icon('heroicon-m-eye')
                    ->url(
                        fn (ProfilTalent $record) =>
                        UtilisateurResource::getUrl('edit', [
                            'record' => $record->utilisateur_id,
                        ])
                    ),
            ])
            ->defaultPaginationPageOption(5);
    }
}
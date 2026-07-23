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

    public function table(Table $table): Table
    {
        return $table
            ->query(
                // ✅ Pas de colonne dédiée "date du dernier changement de
                // disponibilité" — on utilise updated_at comme proxy (mis à
                // jour à chaque modification du profil, dont la dispo).
                ProfilTalent::query()
                    ->with('utilisateur.categorie')
                    ->where('disponibilite', false)
                    ->where('updated_at', '<=', now()->subDays(30))
                    ->orderBy('updated_at')
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('nom_complet')
                    ->label('Talent')
                    ->getStateUsing(fn (ProfilTalent $record) => trim(
                        ($record->utilisateur?->prenom ?? '') . ' ' . ($record->utilisateur?->nom ?? '')
                    )),

                Tables\Columns\TextColumn::make('utilisateur.categorie.nom')
                    ->label('Catégorie')
                    ->badge(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Indisponible depuis')
                    ->formatStateUsing(fn ($state) => $state->diffForHumans()),
            ])
            ->actions([
                Action::make('voir')
                    ->label('Voir')
                    ->icon('heroicon-m-eye')
                    ->url(fn (ProfilTalent $record) => UtilisateurResource::getUrl('edit', ['record' => $record->utilisateur_id])),
            ])
            ->paginated(false);
    }
}
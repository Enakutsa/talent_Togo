<?php

namespace App\Filament\Widgets;

use App\Models\ProfilTalent;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TopTalentsNotes extends BaseWidget
{
    protected static ?string $heading = 'Talents les mieux notés';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                // ✅ Uniquement les avis visibles comptent, comme dans
                // TalentController::calcNote() côté API publique.
                ProfilTalent::query()
                    ->with('utilisateur.categorie')
                    ->whereHas('avis', fn ($q) => $q->where('statut', 'visible'))
                    ->withCount(['avis' => fn ($q) => $q->where('statut', 'visible')])
                    ->withAvg(['avis' => fn ($q) => $q->where('statut', 'visible')], 'note')
                    ->orderByDesc('avis_avg_note')
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

                Tables\Columns\TextColumn::make('avis_avg_note')
                    ->label('Note moyenne')
                    ->formatStateUsing(fn ($state) => number_format((float) $state, 1) . ' ★')
                    ->color('warning'),

                Tables\Columns\TextColumn::make('avis_count')
                    ->label("Nb d'avis"),
            ])
            ->paginated(false);
    }
}
<?php

namespace App\Filament\Widgets;

use App\Models\ProfilTalent;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class TopTalentsNotes extends BaseWidget
{
    protected static ?string $heading = 'Talents les mieux notés';

    protected int|string|array $columnSpan = 1;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                ProfilTalent::query()
                    ->with('utilisateur.categorie')
                    ->whereHas('avis', fn ($q) => $q->where('statut', 'visible'))
                    ->withCount([
                        'avis' => fn ($q) => $q->where('statut', 'visible'),
                    ])
                    ->withAvg([
                        'avis' => fn ($q) => $q->where('statut', 'visible'),
                    ], 'note')
                    ->orderByDesc('avis_avg_note')
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

                Tables\Columns\TextColumn::make('avis_avg_note')
                    ->label('Note moyenne')
                    ->formatStateUsing(
                        fn ($state) => number_format((float) ($state ?? 0), 1) . ' ★'
                    )
                    ->color('warning'),

                Tables\Columns\TextColumn::make('avis_count')
                    ->label("Nb d'avis"),
            ])
            ->defaultPaginationPageOption(5);
    }
}
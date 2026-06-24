<?php

namespace App\Filament\Resources\ProfilTalent\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Storage;

class ProfilTalentTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
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

                TextColumn::make('document_justificatif')
                    ->label('Document')
                    ->formatStateUsing(fn ($state) => $state ? 'Voir le document' : 'Aucun')
                    ->url(fn ($record) => $record->document_justificatif
                        ? Storage::url($record->document_justificatif)
                        : null)
                    ->openUrlInNewTab()
                    ->color(fn ($record) => $record->document_justificatif ? 'primary' : 'gray')
                    ->icon('heroicon-o-document-text'),

                TextColumn::make('statut')
                    ->label('Statut')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'en_attente' => 'warning',
                        'valide' => 'success',
                        'rejete' => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'en_attente' => 'En attente',
                        'valide' => 'Validé',
                        'rejete' => 'Rejeté',
                        default => $state,
                    })
                    ->sortable(),

                TextColumn::make('motif_rejet')
                    ->label('Motif de rejet')
                    ->limit(40)
                    ->toggleable()
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
                SelectFilter::make('statut')
                    ->label('Statut')
                    ->options([
                        'en_attente' => 'En attente',
                        'valide' => 'Validé',
                        'rejete' => 'Rejeté',
                    ]),

                SelectFilter::make('categorie_id')
                    ->label('Catégorie')
                    ->relationship('categorie', 'nom'),
            ])
            ->recordActions([
                Action::make('valider')
                    ->label('Valider')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->statut !== 'valide')
                    ->requiresConfirmation()
                    ->modalHeading('Valider ce talent')
                    ->modalDescription('Ce talent sera publié sur la plateforme et visible par tous les clients.')
                    ->modalSubmitActionLabel('Confirmer la validation')
                    ->action(function ($record) {
                        $record->update([
                            'statut' => 'valide',
                            'motif_rejet' => null,
                        ]);

                        Notification::make()
                            ->title('Talent validé')
                            ->success()
                            ->send();
                    }),

                Action::make('rejeter')
                    ->label('Rejeter')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $record->statut !== 'rejete')
                    ->schema([
                        Textarea::make('motif_rejet')
                            ->label('Motif du rejet')
                            ->placeholder('Expliquez pourquoi ce profil est rejeté (document illisible, informations incohérentes...)')
                            ->required()
                            ->rows(4),
                    ])
                    ->modalHeading('Rejeter ce talent')
                    ->modalDescription('Le talent recevra ce motif et pourra corriger son dossier.')
                    ->modalSubmitActionLabel('Confirmer le rejet')
                    ->action(function ($record, array $data) {
                        $record->update([
                            'statut' => 'rejete',
                            'motif_rejet' => $data['motif_rejet'],
                        ]);

                        Notification::make()
                            ->title('Talent rejeté')
                            ->body('Le motif a été enregistré.')
                            ->warning()
                            ->send();
                    }),

                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
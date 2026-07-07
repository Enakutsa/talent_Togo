<?php

namespace App\Filament\Resources\Utilisateurs\Tables;

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

                TextColumn::make('statut')
                    ->label('Statut')
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

                SelectFilter::make('statut')
                    ->label('Statut')
                    ->options([
                        'valide' => 'Validé',
                        'actif' => 'Actif',
                        'en_attente' => 'En attente',
                        'rejete' => 'Rejeté',
                        'desactive' => 'Désactivé',
                    ]),
            ])
            ->recordActions([
                // ✅ Valider un profil talent en attente
                Action::make('valider')
                    ->label('Valider')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->role === 'talent' && $record->statut !== 'valide')
                    ->requiresConfirmation()
                    ->modalHeading('Valider ce profil talent ?')
                    ->modalDescription('Le talent recevra un e-mail l\'informant que son compte est actif.')
                    ->action(function ($record) {
                        $record->update([
                            'statut' => 'valide',
                            'motif_rejet' => null,
                        ]);

                        // TODO: brancher ici votre Mailable (ex: TalentValideMail)
                        // Mail::to($record->email)->queue(new TalentValideMail($record));

                        Notification::make()
                            ->title('Profil validé')
                            ->success()
                            ->send();
                    }),

                // ✅ Rejeter un profil talent (avec motif obligatoire)
                Action::make('rejeter')
                    ->label('Rejeter')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $record->role === 'talent' && $record->statut !== 'rejete')
                    ->requiresConfirmation()
                    ->schema([
                        Textarea::make('motif_rejet')
                            ->label('Motif du rejet')
                            ->required()
                            ->rows(3)
                            ->placeholder('Ex: document justificatif illisible ou incomplet'),
                    ])
                    ->action(function ($record, array $data) {
                        $record->update([
                            'statut' => 'rejete',
                            'motif_rejet' => $data['motif_rejet'],
                        ]);

                        // TODO: brancher ici votre Mailable (ex: TalentRejeteMail)
                        // Mail::to($record->email)->queue(new TalentRejeteMail($record));

                        Notification::make()
                            ->title('Profil rejeté')
                            ->warning()
                            ->send();
                    }),

                // ✅ Réactiver un compte désactivé
                Action::make('activer')
                    ->label('Activer')
                    ->icon('heroicon-o-lock-open')
                    ->color('success')
                    ->visible(fn ($record) => $record->statut === 'desactive')
                    ->requiresConfirmation()
                    ->action(function ($record) {
                        // Un talent réactivé repasse "valide", un client redevient "actif"
                        $record->update([
                            'statut' => $record->role === 'talent' ? 'valide' : 'actif',
                        ]);

                        Notification::make()
                            ->title('Compte réactivé')
                            ->success()
                            ->send();
                    }),

                // ✅ Suspendre / bloquer un compte
                Action::make('desactiver')
                    ->label('Désactiver')
                    ->icon('heroicon-o-lock-closed')
                    ->color('gray')
                    ->visible(fn ($record) => $record->statut !== 'desactive' && $record->role !== 'admin')
                    ->requiresConfirmation()
                    ->modalDescription('L\'utilisateur ne pourra plus se connecter tant que son compte n\'est pas réactivé.')
                    ->action(function ($record) {
                        $record->update(['statut' => 'desactive']);

                        Notification::make()
                            ->title('Compte désactivé')
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
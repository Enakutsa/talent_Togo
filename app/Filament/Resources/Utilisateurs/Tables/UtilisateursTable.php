<?php

namespace App\Filament\Resources\Utilisateurs\Tables;

use App\Mail\TalentDesactiveMail;
use App\Mail\TalentReactiveMail;
use App\Mail\TalentRejeteMail;
use App\Mail\TalentValideMail;
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
use Illuminate\Support\Facades\Mail;

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

                TextColumn::make('categorie.nom')
                    ->label('Catégorie')
                    ->badge()
                    ->color('gray')
                    ->searchable()
                    ->sortable()
                    ->placeholder('—')
                    ->toggleable(),

                TextColumn::make('ville')
                    ->label('Ville')
                    ->icon('heroicon-o-map-pin')
                    ->searchable()
                    ->sortable()
                    ->placeholder('—')
                    ->toggleable(),

                TextColumn::make('document_justificatif')
                    ->label('Document')
                    ->formatStateUsing(fn ($state) => $state ? 'Voir le document' : 'Aucun')
                    ->url(fn ($record) => $record->document_justificatif
                        ? \Illuminate\Support\Facades\Storage::url($record->document_justificatif)
                        : null)
                    ->openUrlInNewTab()
                    ->color(fn ($record) => $record->document_justificatif ? 'primary' : 'gray')
                    ->icon('heroicon-o-document-text')
                    ->toggleable(),

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

                SelectFilter::make('categorie_id')
                    ->label('Catégorie')
                    ->relationship('categorie', 'nom'),
            ])
            ->recordActions([
                // ✅ Valider un profil talent en attente
                // Uniquement visible tant que le talent est "en_attente" (nouvelle inscription).
                // Une fois validé ou rejeté, ce bouton disparaît.
                Action::make('valider')
                    ->label('Valider')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn ($record) => $record->role === 'talent' && $record->statut === 'en_attente')
                    ->requiresConfirmation()
                    ->modalHeading('Valider ce profil talent ?')
                    ->modalDescription('Le talent recevra un e-mail l\'informant que son compte est actif.')
                    ->action(function ($record) {
                        $record->update([
                            'statut' => 'valide',
                            'motif_rejet' => null,
                        ]);

                        try {
                            Mail::to($record->email)->queue(new TalentValideMail($record));
                        } catch (\Exception $e) {}

                        Notification::make()
                            ->title('Profil validé')
                            ->success()
                            ->send();
                    }),

                // ✅ Rejeter un profil talent (avec motif obligatoire)
                // Même règle : uniquement depuis "en_attente". Un rejet est définitif
                // (le talent devra se réinscrire ou contacter le support).
                Action::make('rejeter')
                    ->label('Rejeter')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn ($record) => $record->role === 'talent' && $record->statut === 'en_attente')
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

                        try {
                            Mail::to($record->email)->queue(new TalentRejeteMail($record, $data['motif_rejet']));
                        } catch (\Exception $e) {}

                        Notification::make()
                            ->title('Profil rejeté')
                            ->warning()
                            ->send();
                    }),

                // ✅ Réactiver un compte désactivé (talent ou client)
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

                        if ($record->role === 'talent') {
                            try {
                                Mail::to($record->email)->queue(new TalentReactiveMail($record));
                            } catch (\Exception $e) {}
                        }

                        Notification::make()
                            ->title('Compte réactivé')
                            ->success()
                            ->send();
                    }),

                // ✅ Suspendre un compte actif (talent validé ou client actif)
                // Ni un compte en_attente, ni un compte rejeté, ni un admin.
                Action::make('desactiver')
                    ->label('Désactiver')
                    ->icon('heroicon-o-lock-closed')
                    ->color('gray')
                    ->visible(fn ($record) => in_array($record->statut, ['valide', 'actif']) && $record->role !== 'admin')
                    ->requiresConfirmation()
                    ->modalDescription('L\'utilisateur ne pourra plus se connecter tant que son compte n\'est pas réactivé.')
                    ->action(function ($record) {
                        $record->update(['statut' => 'desactive']);

                        if ($record->role === 'talent') {
                            try {
                                Mail::to($record->email)->queue(new TalentDesactiveMail($record));
                            } catch (\Exception $e) {}
                        }

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
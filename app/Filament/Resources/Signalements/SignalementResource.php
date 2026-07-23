<?php

namespace App\Filament\Resources\Signalements;

use App\Filament\Resources\Signalements\Pages;
use App\Mail\TalentDesactiveMail;
use App\Mail\TalentReactiveMail;
use App\Models\Signalement;
use BackedEnum;
use Filament\Actions;
use Filament\Forms;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Mail;

class SignalementResource extends Resource
{
    protected static ?string $model = Signalement::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-flag';

    protected static string|\UnitEnum|null $navigationGroup = 'Modération';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Signalements';

    protected static ?string $modelLabel = 'signalement';

    protected static ?string $pluralModelLabel = 'signalements';

    public static function getNavigationBadge(): ?string
    {
        return static::getModel()::where('statut', 'en_attente')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Forms\Components\Select::make('client_id')
                    ->relationship('client', 'nom')
                    ->getOptionLabelFromRecordUsing(
                        fn($record) => trim("{$record->prenom} {$record->nom}")
                    )
                    ->disabled()
                    ->label('Signalé par'),

                Forms\Components\Select::make('profil_talent_id')
                    ->relationship('profilTalent.utilisateur', 'nom')
                    ->getOptionLabelFromRecordUsing(
                        fn($record) => trim("{$record->prenom} {$record->nom}")
                    )
                    ->disabled()
                    ->label('Talent signalé'),

                Forms\Components\Select::make('motif')
                    ->options([
                        'contenu_inapproprie' => 'Contenu inapproprié',
                        'faux_profil' => 'Faux profil',
                        'arnaque' => 'Arnaque / fraude',
                        'comportement_abusif' => 'Comportement abusif',
                        'autre' => 'Autre',
                    ])
                    ->disabled()
                    ->required(),

                Forms\Components\Textarea::make('description')
                    ->disabled()
                    ->columnSpanFull(),

                Forms\Components\Select::make('statut')
                    ->options([
                        'en_attente' => 'En attente',
                        'traite' => 'Traité',
                    ])
                    ->required(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('client.prenom')
                    ->label('Signalé par')
                    ->formatStateUsing(
                        fn($record) => trim(
                            "{$record->client?->prenom} {$record->client?->nom}"
                        )
                    )
                    ->searchable(['prenom', 'nom']),

                Tables\Columns\TextColumn::make('profilTalent.utilisateur.prenom')
                    ->label('Talent signalé')
                    ->formatStateUsing(
                        fn($record) => trim(
                            "{$record->profilTalent?->utilisateur?->prenom} {$record->profilTalent?->utilisateur?->nom}"
                        )
                    )
                    ->searchable(),

                Tables\Columns\BadgeColumn::make('motif')
                    ->colors([
                        'danger' => 'arnaque',
                        'warning' => 'comportement_abusif',
                        'gray' => ['contenu_inapproprie', 'faux_profil', 'autre'],
                    ])
                    ->formatStateUsing(
                        fn(string $state): string => match ($state) {
                            'contenu_inapproprie' => 'Contenu inapproprié',
                            'faux_profil' => 'Faux profil',
                            'arnaque' => 'Arnaque / fraude',
                            'comportement_abusif' => 'Comportement abusif',
                            default => 'Autre',
                        }
                    ),

                Tables\Columns\TextColumn::make('description')
                    ->limit(50)
                    ->tooltip(fn($record) => $record->description)
                    ->placeholder('—'),

                Tables\Columns\BadgeColumn::make('profilTalent.utilisateur.statut')
                    ->label('Statut du talent')
                    ->colors([
                        'success' => 'valide',
                        'danger' => 'desactive',
                        'warning' => 'en_attente',
                    ]),

                Tables\Columns\BadgeColumn::make('statut')
                    ->label('Signalement')
                    ->colors([
                        'warning' => 'en_attente',
                        'success' => 'traite',
                    ])
                    ->formatStateUsing(
                        fn(string $state): string => $state === 'en_attente'
                            ? 'En attente'
                            : 'Traité'
                    ),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Envoyé le')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('statut')
                    ->options([
                        'en_attente' => 'En attente',
                        'traite' => 'Traité',
                    ]),

                Tables\Filters\SelectFilter::make('motif')
                    ->options([
                        'contenu_inapproprie' => 'Contenu inapproprié',
                        'faux_profil' => 'Faux profil',
                        'arnaque' => 'Arnaque / fraude',
                        'comportement_abusif' => 'Comportement abusif',
                        'autre' => 'Autre',
                    ]),
            ])
            ->actions([
                Actions\Action::make('desactiver')
                    ->label('Désactiver le talent')
                    ->icon('heroicon-o-lock-closed')
                    ->color('danger')
                    ->visible(
                        fn(Signalement $record) =>
                        in_array(
                            $record->profilTalent?->utilisateur?->statut,
                            ['valide', 'actif']
                        )
                    )
                    ->requiresConfirmation()
                    ->modalHeading('Désactiver ce talent ?')
                    ->modalDescription(
                        "L'utilisateur ne pourra plus se connecter tant que son compte n'est pas réactivé."
                    )
                    ->action(function (Signalement $record) {
                        $talent = $record->profilTalent?->utilisateur;

                        $talent?->update([
                            'statut' => 'desactive',
                        ]);

                        $record->update([
                            'statut' => 'traite',
                        ]);

                        if ($talent && $talent->role === 'talent') {
                            try {
                                Mail::to($talent->email)
                                    ->queue(new TalentDesactiveMail($talent));
                            } catch (\Exception $e) {
                            }
                        }

                        Notification::make()
                            ->title('Talent désactivé')
                            ->success()
                            ->send();
                    }),

                Actions\Action::make('activer')
                    ->label('Réactiver')
                    ->icon('heroicon-o-lock-open')
                    ->color('success')
                    ->visible(
                        fn(Signalement $record) =>
                        $record->profilTalent?->utilisateur?->statut === 'desactive'
                    )
                    ->requiresConfirmation()
                    ->modalHeading('Réactiver ce talent ?')
                    ->action(function (Signalement $record) {
                        $talent = $record->profilTalent?->utilisateur;

                        $talent?->update([
                            'statut' => 'valide',
                        ]);

                        if ($talent) {
                            try {
                                Mail::to($talent->email)
                                    ->queue(new TalentReactiveMail($talent));
                            } catch (\Exception $e) {
                            }
                        }

                        Notification::make()
                            ->title('Talent réactivé')
                            ->success()
                            ->send();
                    }),

                Actions\Action::make('rejeter')
                    ->label('Rejeter')
                    ->icon('heroicon-o-x-mark')
                    ->color('gray')
                    ->visible(
                        fn(Signalement $record) =>
                        $record->statut === 'en_attente'
                    )
                    ->requiresConfirmation()
                    ->modalHeading('Rejeter ce signalement ?')
                    ->modalDescription(
                        'Aucune action ne sera prise sur le compte du talent.'
                    )
                    ->action(function (Signalement $record) {
                        $record->update([
                            'statut' => 'traite',
                        ]);

                        Notification::make()
                            ->title('Signalement rejeté')
                            ->send();
                    }),

                Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Actions\BulkActionGroup::make([
                    Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSignalements::route('/'),
            'edit' => Pages\EditSignalement::route('/{record}/edit'),
        ];
    }
}
<?php

namespace App\Filament\Resources\ProfilTalent\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class ProfilTalentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Identité')
                    ->columns(2)
                    ->components([
                        Select::make('utilisateur_id')
                            ->label('Utilisateur')
                            ->relationship('utilisateur', 'nom')
                            ->getOptionLabelFromRecordUsing(fn ($record) => trim($record->prenom . ' ' . $record->nom) . ' — ' . $record->email)
                            ->searchable()
                            ->preload()
                            ->required(),

                        Select::make('categorie_id')
                            ->label('Catégorie')
                            ->relationship('categorie', 'nom')
                            ->searchable()
                            ->preload()
                            ->required(),

                        TextInput::make('utilisateur.telephone')
                            ->label('Téléphone')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($record) => $record?->utilisateur?->telephone),

                        // ℹ️ Lecture seule : le statut du compte vit maintenant sur
                        // Utilisateur. On l'affiche ici pour info, mais toute action
                        // (Valider/Rejeter/Activer/Désactiver) se fait depuis la
                        // resource "Utilisateurs".
                        TextInput::make('utilisateur.statut')
                            ->label('Statut du compte')
                            ->disabled()
                            ->dehydrated(false)
                            ->formatStateUsing(fn ($record) => match ($record?->utilisateur?->statut) {
                                'valide' => 'Validé',
                                'en_attente' => 'En attente',
                                'rejete' => 'Rejeté',
                                'desactive' => 'Désactivé',
                                default => $record?->utilisateur?->statut ?? '—',
                            }),
                    ]),

                Section::make('Informations professionnelles')
                    ->columns(2)
                    ->components([
                        TextInput::make('ville')
                            ->required(),

                        Toggle::make('disponibilite')
                            ->label('Disponible')
                            ->default(true)
                            ->inline(false),

                        TextInput::make('tarif_min')
                            ->label('Tarif minimum (FCFA)')
                            ->numeric()
                            ->prefix('FCFA'),

                        TextInput::make('tarif_max')
                            ->label('Tarif maximum (FCFA)')
                            ->numeric()
                            ->prefix('FCFA'),

                        Textarea::make('biographie')
                            ->label('Biographie')
                            ->columnSpanFull()
                            ->rows(4),
                    ]),

                Section::make('Photo de profil')
                    ->components([
                        FileUpload::make('photo')
                            ->label('Photo de profil')
                            ->disk('public')
                            ->directory('photos_talents')
                            ->image()
                            ->avatar()
                            ->acceptedFileTypes(['image/jpeg', 'image/png']),
                    ]),

                Section::make('Statistiques')
                    ->columns(2)
                    ->components([
                        TextInput::make('vues')
                            ->numeric()
                            ->default(0)
                            ->disabled()
                            ->dehydrated(),
                    ]),
            ]);
    }
}
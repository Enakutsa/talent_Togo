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

                Section::make('Photo et document justificatif')
                    ->columns(2)
                    ->components([
                        FileUpload::make('photo')
                            ->label('Photo de profil')
                            ->disk('public')
                            ->directory('photos_talents')
                            ->image()
                            ->avatar()
                            ->acceptedFileTypes(['image/jpeg', 'image/png']),

                        FileUpload::make('document_justificatif')
                            ->label('Document (CNI, certificat, portfolio...)')
                            ->disk('public')
                            ->directory('documents_justificatifs')
                            ->acceptedFileTypes(['application/pdf', 'image/jpeg', 'image/png'])
                            ->downloadable()
                            ->openable()
                            ->previewable(true),
                    ]),

                Section::make('Modération')
                    ->columns(2)
                    ->components([
                        Select::make('statut')
                            ->options([
                                'en_attente' => 'En attente',
                                'valide' => 'Validé',
                                'rejete' => 'Rejeté',
                            ])
                            ->default('en_attente')
                            ->required()
                            ->native(false),

                        TextInput::make('vues')
                            ->numeric()
                            ->default(0)
                            ->disabled()
                            ->dehydrated(),

                        Textarea::make('motif_rejet')
                            ->label('Motif de rejet')
                            ->columnSpanFull()
                            ->rows(3)
                            ->visible(fn ($get) => $get('statut') === 'rejete'),
                    ]),
            ]);
    }
}
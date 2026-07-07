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
                Select::make('utilisateur_id')
                    ->label('Utilisateur')
                    ->relationship('utilisateur', 'nom')
                    ->getOptionLabelFromRecordUsing(fn ($record) => trim($record->prenom . ' ' . $record->nom) . ' — ' . $record->email)
                    ->searchable()
                    ->preload()
                    ->required(),

                Section::make('Profil')
                    ->columns(2)
                    ->components([
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

                FileUpload::make('photo')
                    ->label('Photo de profil')
                    ->disk('public')
                    ->directory('photos_talents')
                    ->image()
                    ->avatar()
                    ->acceptedFileTypes(['image/jpeg', 'image/png']),
            ]);
    }
}
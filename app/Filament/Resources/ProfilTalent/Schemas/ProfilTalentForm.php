<?php

namespace App\Filament\Resources\ProfilTalent\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ProfilTalentForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('utilisateur_id')
                    ->required()
                    ->numeric(),
                TextInput::make('categorie_id')
                    ->required()
                    ->numeric(),
                TextInput::make('ville')
                    ->required(),
                TextInput::make('tarif_min')
                    ->numeric(),
                TextInput::make('tarif_max')
                    ->numeric(),
                Textarea::make('biographie')
                    ->columnSpanFull(),
                Toggle::make('disponibilite')
                    ->required(),
                TextInput::make('statut')
                    ->required()
                    ->default('en_attente'),
                TextInput::make('vues')
                    ->required()
                    ->numeric()
                    ->default(0),
                Textarea::make('motif_rejet')
                    ->columnSpanFull(),
            ]);
    }
}

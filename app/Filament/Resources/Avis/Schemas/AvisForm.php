<?php

namespace App\Filament\Resources\Avis\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class AvisForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('client_id')
                    ->required()
                    ->numeric(),
                TextInput::make('profil_talent_id')
                    ->required()
                    ->numeric(),
                TextInput::make('demande_prestation_id')
                    ->numeric(),
                TextInput::make('note')
                    ->required()
                    ->numeric(),
                Textarea::make('commentaire')
                    ->columnSpanFull(),
                TextInput::make('statut')
                    ->required()
                    ->default('visible'),
            ]);
    }
}

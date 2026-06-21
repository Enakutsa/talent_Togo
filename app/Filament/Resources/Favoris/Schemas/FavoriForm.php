<?php

namespace App\Filament\Resources\Favoris\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class FavoriForm
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
            ]);
    }
}

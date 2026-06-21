<?php

namespace App\Filament\Resources\DemandePrestations\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class DemandePrestationForm
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
                TextInput::make('statut')
                    ->required()
                    ->default('en_attente'),
                Textarea::make('message_initial')
                    ->required()
                    ->columnSpanFull(),
                DatePicker::make('date_souhaitee'),
                TextInput::make('budget')
                    ->numeric(),
            ]);
    }
}

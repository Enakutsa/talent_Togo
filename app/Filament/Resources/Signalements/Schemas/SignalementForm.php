<?php

namespace App\Filament\Resources\Signalements\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class SignalementForm
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
                TextInput::make('motif')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
                TextInput::make('statut')
                    ->required()
                    ->default('en_attente'),
            ]);
    }
}

<?php

namespace App\Filament\Resources\Utilisateurs\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class UtilisateurForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('nom')
                    ->required(),
                TextInput::make('prenom')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                DateTimePicker::make('email_verified_at'),
                TextInput::make('mot_de_passe')
                    ->required(),
                TextInput::make('role')
                    ->required()
                    ->default('client'),
                Toggle::make('is_verified')
                    ->required(),
            ]);
    }
}

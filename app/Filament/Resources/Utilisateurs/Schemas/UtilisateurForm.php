<?php

namespace App\Filament\Resources\Utilisateurs\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class UtilisateurForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Identité')
                    ->columns(2)
                    ->components([
                        TextInput::make('prenom')
                            ->required(),

                        TextInput::make('nom')
                            ->required(),

                        TextInput::make('email')
                            ->label('Adresse e-mail')
                            ->email()
                            ->required(),

                        TextInput::make('telephone')
                            ->label('Téléphone')
                            ->tel(),
                    ]),

                Section::make('Compte')
                    ->columns(2)
                    ->components([
                        Select::make('role')
                            ->label('Rôle')
                            ->options([
                                'admin' => 'Administrateur',
                                'talent' => 'Talent',
                                'client' => 'Client',
                            ])
                            ->default('client')
                            ->required()
                            ->native(false),

                        TextInput::make('mot_de_passe')
                            ->label('Mot de passe')
                            ->password()
                            ->revealable()
                            ->dehydrated(fn ($state) => filled($state))
                            ->required(fn (string $operation) => $operation === 'create')
                            ->helperText('Laisser vide pour ne pas modifier le mot de passe.'),

                        Toggle::make('is_verified')
                            ->label('Compte vérifié')
                            ->inline(false),

                        DateTimePicker::make('email_verified_at')
                            ->label('E-mail vérifié le'),
                    ]),
            ]);
    }
}
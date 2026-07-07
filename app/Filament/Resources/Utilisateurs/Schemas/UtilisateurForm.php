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
    // Même liste que le formulaire d'inscription React (Inscription.jsx),
    // pour rester cohérent entre les deux points de saisie.
    private const VILLES_TOGO = [
        'Lomé',
        'Aného',
        'Tsévié',
        'Vogan',
        'Tabligbo',
        'Notsé',
        'Kpalimé',
        'Atakpamé',
        'Amlamé',
        'Badou',
        'Sotouboua',
        'Sokodé',
        'Bassar',
        'Kara',
        'Niamtougou',
        'Kandé',
        'Mango',
        'Dapaong',
    ];

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
                            ->native(false)
                            ->live(),

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

                // Visibles uniquement pour un compte Talent
                Section::make('Profil talent')
                    ->columns(2)
                    ->visible(fn ($get) => $get('role') === 'talent')
                    ->components([
                        Select::make('categorie_id')
                            ->label('Catégorie')
                            ->relationship('categorie', 'nom')
                            ->searchable()
                            ->preload()
                            ->required(fn ($get) => $get('role') === 'talent'),

                        Select::make('ville')
                            ->label('Ville')
                            ->options(array_combine(self::VILLES_TOGO, self::VILLES_TOGO))
                            ->searchable()
                            ->required(fn ($get) => $get('role') === 'talent'),
                    ]),
            ]);
    }
}
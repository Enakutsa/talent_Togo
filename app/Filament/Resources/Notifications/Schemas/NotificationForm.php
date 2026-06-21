<?php

namespace App\Filament\Resources\Notifications\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class NotificationForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('utilisateur_id')
                    ->required()
                    ->numeric(),
                TextInput::make('type')
                    ->required(),
                Textarea::make('contenu')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('data'),
                Toggle::make('lu')
                    ->required(),
            ]);
    }
}

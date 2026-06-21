<?php

namespace App\Filament\Resources\Otps\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class OtpForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('utilisateur_id')
                    ->required()
                    ->numeric(),
                TextInput::make('code')
                    ->required(),
                TextInput::make('type')
                    ->required()
                    ->default('inscription'),
                DateTimePicker::make('expire_a')
                    ->required(),
                Toggle::make('utilise')
                    ->required(),
            ]);
    }
}

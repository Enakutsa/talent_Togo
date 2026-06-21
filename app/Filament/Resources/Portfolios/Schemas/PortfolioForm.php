<?php

namespace App\Filament\Resources\Portfolios\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class PortfolioForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('profil_talent_id')
                    ->required()
                    ->numeric(),
                TextInput::make('type')
                    ->required(),
                TextInput::make('media_url')
                    ->url()
                    ->required(),
                TextInput::make('public_id')
                    ->required(),
                Textarea::make('description')
                    ->columnSpanFull(),
            ]);
    }
}

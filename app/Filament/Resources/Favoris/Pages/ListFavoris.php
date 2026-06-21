<?php

namespace App\Filament\Resources\Favoris\Pages;

use App\Filament\Resources\Favoris\FavoriResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListFavoris extends ListRecords
{
    protected static string $resource = FavoriResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

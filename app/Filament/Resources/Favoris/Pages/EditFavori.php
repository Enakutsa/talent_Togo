<?php

namespace App\Filament\Resources\Favoris\Pages;

use App\Filament\Resources\Favoris\FavoriResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditFavori extends EditRecord
{
    protected static string $resource = FavoriResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

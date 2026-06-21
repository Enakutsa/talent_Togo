<?php

namespace App\Filament\Resources\Categories\Pages;

use App\Filament\Resources\Categories\CategorieResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCategorie extends EditRecord
{
    protected static string $resource = CategorieResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

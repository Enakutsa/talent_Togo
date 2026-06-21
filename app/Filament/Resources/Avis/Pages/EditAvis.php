<?php

namespace App\Filament\Resources\Avis\Pages;

use App\Filament\Resources\Avis\AvisResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAvis extends EditRecord
{
    protected static string $resource = AvisResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

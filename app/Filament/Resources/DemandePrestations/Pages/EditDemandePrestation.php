<?php

namespace App\Filament\Resources\DemandePrestations\Pages;

use App\Filament\Resources\DemandePrestations\DemandePrestationResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditDemandePrestation extends EditRecord
{
    protected static string $resource = DemandePrestationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

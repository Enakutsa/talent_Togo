<?php

namespace App\Filament\Resources\DemandePrestations\Pages;

use App\Filament\Resources\DemandePrestations\DemandePrestationResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListDemandePrestations extends ListRecords
{
    protected static string $resource = DemandePrestationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

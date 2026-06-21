<?php

namespace App\Filament\Resources\Avis\Pages;

use App\Filament\Resources\Avis\AvisResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAvis extends ListRecords
{
    protected static string $resource = AvisResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

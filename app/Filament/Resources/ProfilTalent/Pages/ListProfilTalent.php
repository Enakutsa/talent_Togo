<?php

namespace App\Filament\Resources\ProfilTalent\Pages;

use App\Filament\Resources\ProfilTalent\ProfilTalentResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProfilTalent extends ListRecords
{
    protected static string $resource = ProfilTalentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

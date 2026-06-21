<?php

namespace App\Filament\Resources\ProfilTalent\Pages;

use App\Filament\Resources\ProfilTalent\ProfilTalentResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProfilTalent extends EditRecord
{
    protected static string $resource = ProfilTalentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}

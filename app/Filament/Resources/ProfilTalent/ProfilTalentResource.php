<?php

namespace App\Filament\Resources\ProfilTalent;

use App\Filament\Resources\ProfilTalent\Pages\CreateProfilTalent;
use App\Filament\Resources\ProfilTalent\Pages\EditProfilTalent;
use App\Filament\Resources\ProfilTalent\Pages\ListProfilTalent;
use App\Filament\Resources\ProfilTalent\Schemas\ProfilTalentForm;
use App\Filament\Resources\ProfilTalent\Tables\ProfilTalentTable;
use App\Models\ProfilTalent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ProfilTalentResource extends Resource
{
    protected static ?string $model = ProfilTalent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return ProfilTalentForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ProfilTalentTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListProfilTalent::route('/'),
            'create' => CreateProfilTalent::route('/create'),
            'edit' => EditProfilTalent::route('/{record}/edit'),
        ];
    }
}

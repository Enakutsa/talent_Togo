<?php

namespace App\Filament\Resources\DemandePrestations;

use App\Filament\Resources\DemandePrestations\Pages\CreateDemandePrestation;
use App\Filament\Resources\DemandePrestations\Pages\EditDemandePrestation;
use App\Filament\Resources\DemandePrestations\Pages\ListDemandePrestations;
use App\Filament\Resources\DemandePrestations\Schemas\DemandePrestationForm;
use App\Filament\Resources\DemandePrestations\Tables\DemandePrestationsTable;
use App\Models\DemandePrestation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DemandePrestationResource extends Resource
{
    protected static ?string $model = DemandePrestation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return DemandePrestationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DemandePrestationsTable::configure($table);
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
            'index' => ListDemandePrestations::route('/'),
            'create' => CreateDemandePrestation::route('/create'),
            'edit' => EditDemandePrestation::route('/{record}/edit'),
        ];
    }
}

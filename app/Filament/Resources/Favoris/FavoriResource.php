<?php

namespace App\Filament\Resources\Favoris;

use App\Filament\Resources\Favoris\Pages\CreateFavori;
use App\Filament\Resources\Favoris\Pages\EditFavori;
use App\Filament\Resources\Favoris\Pages\ListFavoris;
use App\Filament\Resources\Favoris\Schemas\FavoriForm;
use App\Filament\Resources\Favoris\Tables\FavorisTable;
use App\Models\Favori;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class FavoriResource extends Resource
{
    protected static ?string $model = Favori::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return FavoriForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return FavorisTable::configure($table);
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
            'index' => ListFavoris::route('/'),
            'create' => CreateFavori::route('/create'),
            'edit' => EditFavori::route('/{record}/edit'),
        ];
    }
}

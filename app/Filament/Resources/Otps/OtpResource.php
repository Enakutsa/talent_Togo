<?php

namespace App\Filament\Resources\Otps;

use App\Filament\Resources\Otps\Pages\CreateOtp;
use App\Filament\Resources\Otps\Pages\EditOtp;
use App\Filament\Resources\Otps\Pages\ListOtps;
use App\Filament\Resources\Otps\Schemas\OtpForm;
use App\Filament\Resources\Otps\Tables\OtpsTable;
use App\Models\Otp;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OtpResource extends Resource
{
    protected static ?string $model = Otp::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return OtpForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OtpsTable::configure($table);
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
            'index' => ListOtps::route('/'),
            'create' => CreateOtp::route('/create'),
            'edit' => EditOtp::route('/{record}/edit'),
        ];
    }
}

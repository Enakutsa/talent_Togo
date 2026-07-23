<?php

namespace App\Filament\Resources\Utilisateurs;

use App\Filament\Resources\Utilisateurs\Pages\CreateUtilisateur;
use App\Filament\Resources\Utilisateurs\Pages\EditUtilisateur;
use App\Filament\Resources\Utilisateurs\Pages\ListUtilisateurs;
use App\Filament\Resources\Utilisateurs\Schemas\UtilisateurForm;
use App\Filament\Resources\Utilisateurs\Tables\UtilisateursTable;
use App\Models\Utilisateur;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class UtilisateurResource extends Resource
{
    protected static ?string $model = Utilisateur::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    // ✅ Groupe de navigation — regroupe cette resource sous "Gestion
    // utilisateurs" dans la sidebar, avec Categories et Profil Talents.
    protected static string|\UnitEnum|null $navigationGroup = 'Gestion utilisateurs';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'email';

    // ✅ Badge avec le nombre de talents en attente de validation — même
    // logique que SignalementResource. Uniquement les talents (role +
    // statut), pas les clients (qui n'ont pas de validation à faire).
    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::where('role', 'talent')
            ->where('statut', 'en_attente')
            ->count();

        return $count ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Schema $schema): Schema
    {
        return UtilisateurForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return UtilisateursTable::configure($table);
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
            'index' => ListUtilisateurs::route('/'),
            'create' => CreateUtilisateur::route('/create'),
            'edit' => EditUtilisateur::route('/{record}/edit'),
        ];
    }
}
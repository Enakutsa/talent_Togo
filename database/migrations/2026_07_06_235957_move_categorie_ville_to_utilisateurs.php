<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ 1. Ajouter les colonnes dans utilisateurs
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->string('ville')->nullable()->after('telephone');
            $table->foreignId('categorie_id')->nullable()->after('ville')
                ->constrained('categories')->nullOnDelete();
        });

        // ✅ 2. Copier les données existantes avant de supprimer les colonnes
        //    (utile si des talents ont déjà rempli ces champs en base)
        DB::table('profils_talents')
            ->select('utilisateur_id', 'categorie_id', 'ville')
            ->get()
            ->each(function ($profil) {
                DB::table('utilisateurs')
                    ->where('id', $profil->utilisateur_id)
                    ->update([
                        'categorie_id' => $profil->categorie_id,
                        'ville'        => $profil->ville,
                    ]);
            });

        // ✅ 3. Retirer les colonnes de profils_talents
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->dropForeign(['categorie_id']);
            $table->dropColumn(['categorie_id', 'ville']);
        });
    }

    public function down(): void
    {
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->string('ville')->nullable();
            $table->foreignId('categorie_id')->nullable()
                ->constrained('categories')->nullOnDelete();
        });

        DB::table('utilisateurs')
            ->select('id', 'categorie_id', 'ville')
            ->whereNotNull('categorie_id')
            ->get()
            ->each(function ($utilisateur) {
                DB::table('profils_talents')
                    ->where('utilisateur_id', $utilisateur->id)
                    ->update([
                        'categorie_id' => $utilisateur->categorie_id,
                        'ville'        => $utilisateur->ville,
                    ]);
            });

        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropForeign(['categorie_id']);
            $table->dropColumn(['categorie_id', 'ville']);
        });
    }
};
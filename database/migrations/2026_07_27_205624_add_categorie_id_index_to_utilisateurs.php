<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            // ⚠️ Si cette colonne est déjà une clé étrangère
            // (foreignId('categorie_id')->constrained()), Laravel a
            // déjà créé cet index automatiquement et cette migration
            // échouera avec "index already exists" — dans ce cas,
            // supprime simplement ce fichier, l'index existe déjà.
            $table->index('categorie_id');
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropIndex(['categorie_id']);
        });
    }
};
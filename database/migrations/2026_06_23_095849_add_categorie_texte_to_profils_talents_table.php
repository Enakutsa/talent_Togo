<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profils_talent', function (Blueprint $table) {
            // categorie_id devient optionnel (en attendant le Module 3)
            $table->foreignId('categorie_id')->nullable()->change();

            // champ texte temporaire pour la catégorie
            $table->string('categorie')->nullable()->after('categorie_id');

            // chemin du fichier uploadé à l'inscription
            $table->string('document_justificatif')->nullable()->after('biographie');
        });
    }

    public function down(): void
    {
        Schema::table('profils_talent', function (Blueprint $table) {
            $table->dropColumn(['categorie', 'document_justificatif']);
            $table->foreignId('categorie_id')->nullable(false)->change();
        });
    }
};
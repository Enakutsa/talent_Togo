<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ 1. Ajouter les colonnes de modération dans utilisateurs
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->string('document_justificatif')->nullable()->after('telephone');
            $table->string('statut')->default('actif')->after('document_justificatif');
            // actif = client normal ou talent validé
            // en_attente = talent inscrit, pas encore validé
            // rejete = talent refusé
            // desactive = compte désactivé par admin
            $table->text('motif_rejet')->nullable()->after('statut');
        });

        // ✅ 2. Nettoyer profils_talents (retirer les colonnes qui vont dans utilisateurs)
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->dropColumn(['document_justificatif', 'statut', 'motif_rejet']);
        });

        // ✅ 3. Rendre nullable les colonnes du profil (remplies après inscription)
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->string('ville')->nullable()->change();
            $table->unsignedBigInteger('categorie_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Annulation : remettre les colonnes dans profils_talents
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->string('document_justificatif')->nullable();
            $table->string('statut')->default('en_attente');
            $table->text('motif_rejet')->nullable();
        });

        // Retirer les colonnes ajoutées dans utilisateurs
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn(['document_justificatif', 'statut', 'motif_rejet']);
        });
    }
};
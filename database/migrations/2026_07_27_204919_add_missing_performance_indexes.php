<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── utilisateurs : role et statut sont filtrés très souvent
        // (StatsController, TalentController via whereHas, filtres de
        // recherche). Index composite car ils sont presque toujours
        // utilisés ensemble (role = 'talent' AND statut = 'valide').
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->index(['role', 'statut']);
            $table->index('ville');
        });

        // ── avis : statut = 'visible' est filtré à chaque calcul de note
        // (calcNote) et sur la liste publique d'avis (/api/avis).
        Schema::table('avis', function (Blueprint $table) {
            $table->index('statut');
        });

        // ── portfolios : type = 'image' est filtré pour la photo de
        // couverture des cartes talents.
        Schema::table('portfolios', function (Blueprint $table) {
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropIndex(['role', 'statut']);
            $table->dropIndex(['ville']);
        });

        Schema::table('avis', function (Blueprint $table) {
            $table->dropIndex(['statut']);
        });

        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropIndex(['type']);
        });
    }
};
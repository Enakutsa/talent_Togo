<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            // 'gratuit' (par défaut, essai 1 mois) ou 'payant' (choisi dès
            // l'inscription — le talent doit régler son abonnement avant
            // d'accéder normalement à la plateforme).
            $table->enum('plan_choisi', ['gratuit', 'payant'])
                ->default('gratuit')
                ->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn('plan_choisi');
        });
    }
};
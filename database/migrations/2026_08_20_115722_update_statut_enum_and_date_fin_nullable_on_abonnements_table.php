<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    public function up(): void
    {
        // ✅ Sur PostgreSQL, Laravel implémente enum() via une contrainte
        // CHECK nommée "{table}_{colonne}_check" — pas un vrai type ENUM
        // comme MySQL. Il faut donc la supprimer puis la recréer avec la
        // valeur supplémentaire, plutôt qu'utiliser ALTER ... MODIFY.
        DB::statement("ALTER TABLE abonnements DROP CONSTRAINT abonnements_statut_check");
        DB::statement("ALTER TABLE abonnements ADD CONSTRAINT abonnements_statut_check CHECK (statut IN ('essai_gratuit', 'actif', 'expire', 'en_attente_paiement'))");

        // ✅ date_fin doit pouvoir être nulle : un abonnement en attente
        // de paiement n'a pas encore de date de fin définie.
        Schema::table('abonnements', function (Blueprint $table) {
            $table->timestamp('date_fin')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('abonnements', function (Blueprint $table) {
            $table->timestamp('date_fin')->nullable(false)->change();
        });

        DB::statement("ALTER TABLE abonnements DROP CONSTRAINT abonnements_statut_check");
        DB::statement("ALTER TABLE abonnements ADD CONSTRAINT abonnements_statut_check CHECK (statut IN ('essai_gratuit', 'actif', 'expire'))");
    }
};
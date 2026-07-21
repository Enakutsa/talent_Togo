<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE demandes_prestation DROP CONSTRAINT demandes_prestation_statut_check');
        DB::statement("ALTER TABLE demandes_prestation ADD CONSTRAINT demandes_prestation_statut_check CHECK (statut IN ('en_attente', 'acceptee', 'refusee', 'terminee', 'conversation'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE demandes_prestation DROP CONSTRAINT demandes_prestation_statut_check');
        DB::statement("ALTER TABLE demandes_prestation ADD CONSTRAINT demandes_prestation_statut_check CHECK (statut IN ('en_attente', 'acceptee', 'refusee', 'terminee'))");
    }
};
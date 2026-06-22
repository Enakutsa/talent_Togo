<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * PostgreSQL ne permet pas de modifier directement une contrainte CHECK
     * générée par un enum() Laravel. On doit la supprimer puis la recréer
     * avec la nouvelle liste de valeurs autorisées.
     */
    public function up(): void
    {
        // Supprime l'ancienne contrainte CHECK générée par enum()
        DB::statement('ALTER TABLE otps DROP CONSTRAINT IF EXISTS otps_type_check');

        // Recrée la contrainte avec 'connexion' en plus
        DB::statement("ALTER TABLE otps ADD CONSTRAINT otps_type_check CHECK (type IN ('inscription', 'reinitialisation_mdp', 'connexion'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE otps DROP CONSTRAINT IF EXISTS otps_type_check');

        DB::statement("ALTER TABLE otps ADD CONSTRAINT otps_type_check CHECK (type IN ('inscription', 'reinitialisation_mdp'))");
    }
};
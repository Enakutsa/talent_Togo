<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->string('categorie')->nullable()->after('categorie_id');
            $table->string('document_justificatif')->nullable()->after('biographie');
            $table->string('motif_rejet')->nullable()->after('statut');
        });

        // categorie_id devient optionnel (en attendant le Module 3)
        DB::statement('ALTER TABLE profils_talents ALTER COLUMN categorie_id DROP NOT NULL');
    }

    public function down(): void
    {
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->dropColumn(['categorie', 'document_justificatif', 'motif_rejet']);
        });

        DB::statement('ALTER TABLE profils_talents ALTER COLUMN categorie_id SET NOT NULL');
    }
};
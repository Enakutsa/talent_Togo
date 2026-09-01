<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes_prestation', function (Blueprint $table) {
            $table->string('livrable_url')->nullable()->after('statut');
            $table->string('livrable_public_id')->nullable()->after('livrable_url');
            $table->string('livrable_nom_fichier')->nullable()->after('livrable_public_id');
            $table->text('livrable_message')->nullable()->after('livrable_nom_fichier');
            $table->timestamp('livrable_date')->nullable()->after('livrable_message');
        });
    }

    public function down(): void
    {
        Schema::table('demandes_prestation', function (Blueprint $table) {
            $table->dropColumn([
                'livrable_url',
                'livrable_public_id',
                'livrable_nom_fichier',
                'livrable_message',
                'livrable_date',
            ]);
        });
    }
};
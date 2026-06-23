<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoris', function (Blueprint $table) {
            $table->id();

            // ✅ client
            $table->foreignId('client_id')
                ->constrained('utilisateurs')
                ->cascadeOnDelete();

            // ✅ profil talent (corrigé)
            $table->foreignId('profil_talent_id')
                ->constrained('profils_talents') // ✅ correction ici
                ->cascadeOnDelete();

            $table->timestamps();

            // ✅ éviter doublons
            $table->unique(['client_id', 'profil_talent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoris');
    }
};
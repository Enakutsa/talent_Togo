<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signalements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->foreignId('profil_talent_id')->constrained('profils_talents')->cascadeOnDelete();
            $table->string('motif');
            $table->text('description')->nullable();
            $table->string('statut')->default('en_attente'); // en_attente | traite | rejete
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('signalements');
    }
};
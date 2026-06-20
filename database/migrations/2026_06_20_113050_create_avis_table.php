<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->foreignId('profil_talent_id')->constrained('profils_talent')->onDelete('cascade');
            $table->foreignId('demande_prestation_id')->nullable()->constrained('demandes_prestation')->onDelete('set null');
            $table->unsignedTinyInteger('note');
            $table->text('commentaire')->nullable();
            $table->enum('statut', ['visible', 'masque'])->default('visible');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};
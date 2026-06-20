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
            $table->foreignId('client_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->foreignId('profil_talent_id')->constrained('profils_talent')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['client_id', 'profil_talent_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoris');
    }
};
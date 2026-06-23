<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes_prestation', function (Blueprint $table) {
            $table->id();

            // ✅ lien client
            $table->foreignId('client_id')
                ->constrained('utilisateurs')
                ->cascadeOnDelete();

            // ✅ lien profil talent (CORRECT)
            $table->foreignId('profil_talent_id')
                ->constrained('profils_talents')
                ->cascadeOnDelete();

            $table->enum('statut', ['en_attente', 'acceptee', 'refusee', 'terminee'])
                ->default('en_attente');

            $table->text('message_initial');

            $table->date('date_souhaitee')->nullable();

            $table->decimal('budget', 10, 2)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes_prestation');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profils_talents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('utilisateur_id')
                ->unique()
                ->constrained('utilisateurs')
                ->onDelete('cascade');

            $table->foreignId('categorie_id')
                ->constrained('categories')
                ->onDelete('cascade');

            $table->string('ville');

            $table->decimal('tarif_min', 10, 2)->nullable();
            $table->decimal('tarif_max', 10, 2)->nullable();

            $table->text('biographie')->nullable();

            $table->boolean('disponibilite')->default(true);

            $table->enum('statut', ['en_attente', 'valide', 'rejete'])
                ->default('en_attente');

            $table->unsignedInteger('vues')->default(0);

            // ✅ IMPORTANT (remplace ancienne migration add)
            $table->string('categorie')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profils_talents');
    }
};

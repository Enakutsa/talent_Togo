<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('abonnements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('utilisateur_id')->constrained('utilisateurs')->cascadeOnDelete();
            $table->enum('statut', ['essai_gratuit', 'actif', 'expire'])->default('essai_gratuit');
            $table->timestamp('date_debut');
            $table->timestamp('date_fin');
            $table->decimal('montant', 10, 2)->nullable();
            $table->string('fedapay_transaction_id')->nullable();
            $table->string('fedapay_statut')->nullable();
            $table->timestamps();
        });

        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->timestamp('abonnement_expire_le')->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn('abonnement_expire_le');
        });
        Schema::dropIfExists('abonnements');
    }
};
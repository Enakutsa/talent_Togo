<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->boolean('modifie')->default(false)->after('contenu');
            $table->boolean('supprime_pour_tous')->default(false)->after('modifie');
            $table->boolean('supprime_expediteur')->default(false)->after('supprime_pour_tous');
            $table->boolean('supprime_destinataire')->default(false)->after('supprime_expediteur');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['modifie', 'supprime_pour_tous', 'supprime_expediteur', 'supprime_destinataire']);
        });
    }
};
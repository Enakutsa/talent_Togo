<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
{
    Schema::table('profils_talents', function (Blueprint $table) {
        $table->string('categorie')->nullable()->after('categorie_id');
        $table->decimal('tarif_min', 10, 2)->nullable()->change();
        $table->decimal('tarif_max', 10, 2)->nullable()->change();
    });
}

public function down(): void
{
    Schema::table('profils_talents', function (Blueprint $table) {
        $table->dropColumn('categorie');
    });
}
};
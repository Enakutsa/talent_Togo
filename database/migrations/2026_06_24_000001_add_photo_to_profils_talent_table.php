<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->string('photo')->nullable()->after('document_justificatif');
        });
    }

    public function down(): void
    {
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->dropColumn('photo');
        });
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->string('ville')->nullable()->change();
            $table->unsignedBigInteger('categorie_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('profils_talents', function (Blueprint $table) {
            $table->string('ville')->nullable(false)->change();
            $table->unsignedBigInteger('categorie_id')->nullable(false)->change();
        });
    }
};
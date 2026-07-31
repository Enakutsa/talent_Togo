<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('provider')->nullable()->after('google_id'); // null = OTP classique, 'google' = via Google

            $table->string('telephone')->nullable()->change();
            $table->string('mot_de_passe')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'provider']);
        });
    }
};
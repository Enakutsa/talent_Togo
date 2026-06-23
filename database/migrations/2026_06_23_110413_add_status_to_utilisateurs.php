<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('utilisateurs', function (Blueprint $table) {

            // ✅ validation admin
            $table->boolean('is_validated')
                  ->default(false)
                  ->after('role');

            // ✅ rejet admin
            $table->boolean('is_rejected')
                  ->default(false)
                  ->after('is_validated');

        });
    }

    public function down()
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropColumn([
                'is_validated',
                'is_rejected'
            ]);
        });
    }
};
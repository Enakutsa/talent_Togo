<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            // ✅ Manquait sur cette table (existe déjà sur profils_talents
            // depuis 2026_07_09_105227) — nécessaire pour que
            // AuthController::update() puisse enregistrer le public_id
            // Cloudinary de la photo de compte (client/admin).
            if (!Schema::hasColumn('utilisateurs', 'photo_public_id')) {
                $table->string('photo_public_id')->nullable()->after('photo');
            }
        });
    }

    public function down(): void
    {
        Schema::table('utilisateurs', function (Blueprint $table) {
            if (Schema::hasColumn('utilisateurs', 'photo_public_id')) {
                $table->dropColumn('photo_public_id');
            }
        });
    }
};
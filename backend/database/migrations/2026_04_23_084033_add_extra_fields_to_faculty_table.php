<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->string('nickname', 50)->nullable()->after('last_name');
            $table->string('civil_status', 20)->nullable()->after('birthdate');
            $table->string('nationality', 50)->nullable()->after('civil_status');
            $table->string('religion', 100)->nullable()->after('nationality');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('faculty', function (Blueprint $table) {
            $table->dropColumn(['nickname', 'civil_status', 'nationality', 'religion']);
        });
    }
};

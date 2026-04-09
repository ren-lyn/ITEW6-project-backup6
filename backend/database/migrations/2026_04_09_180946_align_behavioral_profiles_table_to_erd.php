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
        Schema::table('behavioral_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('behavioral_profiles', 'attendance_percentage')) $table->decimal('attendance_percentage', 5, 2)->nullable();
            if (!Schema::hasColumn('behavioral_profiles', 'punctuality_rating')) $table->decimal('punctuality_rating', 3, 2)->nullable();
            if (!Schema::hasColumn('behavioral_profiles', 'personality_type')) $table->string('personality_type')->nullable();
            if (!Schema::hasColumn('behavioral_profiles', 'behavioral_remarks')) $table->text('behavioral_remarks')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('behavioral_profiles', function (Blueprint $table) {
            $table->dropColumn(['attendance_percentage', 'punctuality_rating', 'personality_type', 'behavioral_remarks']);
        });
    }
};

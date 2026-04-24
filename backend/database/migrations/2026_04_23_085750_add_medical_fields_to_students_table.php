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
        Schema::table('students', function (Blueprint $table) {
            $table->string('blood_type', 10)->nullable()->after('religion');
            $table->text('medical_history')->nullable()->after('blood_type');
            $table->text('allergies')->nullable()->after('medical_history');
            $table->text('medications')->nullable()->after('allergies');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['blood_type', 'medical_history', 'allergies', 'medications']);
        });
    }
};

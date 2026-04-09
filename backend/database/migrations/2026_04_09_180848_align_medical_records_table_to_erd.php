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
        Schema::table('medical_records', function (Blueprint $table) {
            if (!Schema::hasColumn('medical_records', 'blood_type')) $table->string('blood_type')->nullable();
            if (!Schema::hasColumn('medical_records', 'allergies')) $table->text('allergies')->nullable();
            if (!Schema::hasColumn('medical_records', 'chronic_illness')) $table->text('chronic_illness')->nullable();
            if (!Schema::hasColumn('medical_records', 'disability')) $table->string('disability')->nullable();
            if (!Schema::hasColumn('medical_records', 'emergency_name')) $table->string('emergency_name')->nullable();
            if (!Schema::hasColumn('medical_records', 'emergency_contact')) $table->string('emergency_contact')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropColumn(['blood_type', 'allergies', 'chronic_illness', 'disability', 'emergency_name', 'emergency_contact']);
        });
    }
};

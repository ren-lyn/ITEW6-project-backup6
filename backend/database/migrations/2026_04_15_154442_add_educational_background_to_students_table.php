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
            // Educational Background columns
            if (!Schema::hasColumn('students', 'elementary_school')) $table->string('elementary_school')->nullable();
            if (!Schema::hasColumn('students', 'elementary_year_graduated')) $table->string('elementary_year_graduated', 10)->nullable();
            if (!Schema::hasColumn('students', 'elementary_awards')) $table->text('elementary_awards')->nullable();

            if (!Schema::hasColumn('students', 'junior_high_school')) $table->string('junior_high_school')->nullable();
            if (!Schema::hasColumn('students', 'junior_high_year_graduated')) $table->string('junior_high_year_graduated', 10)->nullable();
            if (!Schema::hasColumn('students', 'junior_high_awards')) $table->text('junior_high_awards')->nullable();

            if (!Schema::hasColumn('students', 'senior_high_school')) $table->string('senior_high_school')->nullable();
            if (!Schema::hasColumn('students', 'senior_high_year_graduated')) $table->string('senior_high_year_graduated', 10)->nullable();
            if (!Schema::hasColumn('students', 'senior_high_awards')) $table->text('senior_high_awards')->nullable();

            // Profile submission lock flag
            if (!Schema::hasColumn('students', 'profile_submitted')) $table->boolean('profile_submitted')->default(false);
            if (!Schema::hasColumn('students', 'profile_submitted_at')) $table->timestamp('profile_submitted_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $cols = [
                'elementary_school', 'elementary_year_graduated', 'elementary_awards',
                'junior_high_school', 'junior_high_year_graduated', 'junior_high_awards',
                'senior_high_school', 'senior_high_year_graduated', 'senior_high_awards',
                'profile_submitted', 'profile_submitted_at',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('students', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};

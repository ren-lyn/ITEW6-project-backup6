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
        Schema::table('physical_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('physical_profiles', 'height')) $table->decimal('height', 5, 2)->after('student_id')->nullable();
            if (!Schema::hasColumn('physical_profiles', 'weight')) $table->decimal('weight', 5, 2)->after('height')->nullable();
            if (!Schema::hasColumn('physical_profiles', 'bmi')) $table->decimal('bmi', 4, 2)->after('weight')->nullable();
            if (!Schema::hasColumn('physical_profiles', 'body_measurements')) $table->string('body_measurements')->after('bmi')->nullable();
            if (!Schema::hasColumn('physical_profiles', 'image_presence')) $table->boolean('image_presence')->default(0)->after('body_measurements');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('physical_profiles', function (Blueprint $table) {
            $table->dropColumn(['height', 'weight', 'bmi', 'body_measurements', 'image_presence']);
        });
    }
};

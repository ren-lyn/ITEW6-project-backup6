<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Skip seeding if data already exists
        if (User::where('email', 'admin@ccs.edu')->exists()) {
            return;
        }

        User::updateOrCreate(
            ['email' => 'admin@ccs.edu'],
            [
                'name' => 'CCS Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'approved',
                'must_change_password' => false,
            ]
        );

        User::updateOrCreate(
            ['email' => 'dean@ccs.edu'],
            [
                'name' => 'CCS Dean',
                'password' => Hash::make('password'),
                'role' => 'dean',
                'status' => 'approved',
                'must_change_password' => false,
            ]
        );

        $this->call([
            FacultySeeder::class,
            StudentSeeder::class,
            EventSeeder::class,
            ResearchSeeder::class,
            MaterialSeeder::class,
            ScheduleSeeder::class,
            FacilitySeeder::class,
            InstructionalSeeder::class,
            ComprehensiveProfilingSeeder::class,
            DashboardStatsSeeder::class,
            DocumentTypeSeeder::class,
            PendingAccountsSeeder::class,
            SkillsAndTalentsSeeder::class,
            LargeStudentSeeder::class
        ]);
    }
}

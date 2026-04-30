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
        // Ensure core administrative accounts exist with correct credentials
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

        $this->command->getOutput()->info('Admin and Dean accounts verified.');

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

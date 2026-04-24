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
        User::create([
            'name' => 'CCS Admin',
            'email' => 'admin@ccs.edu',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'approved',
            'must_change_password' => false,
        ]);

        User::create([
            'name' => 'CCS Dean',
            'email' => 'dean@ccs.edu',
            'password' => Hash::make('password'),
            'role' => 'dean',
            'status' => 'approved',
            'must_change_password' => false,
        ]);

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

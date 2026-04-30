<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Faculty;
use Illuminate\Support\Facades\Hash;

class FacultySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'turing@faculty.edu'],
            [
                'name' => 'Dr. Alan Turing',
                'password' => Hash::make('password'),
                'role' => 'faculty',
                'status' => 'approved',
                'must_change_password' => false,
            ]
        );

        Faculty::updateOrCreate(
            ['email' => 'turing@faculty.edu'],
            [
                'user_id' => $user->id,
                'id_number' => 'EMP-101',
                'first_name' => 'Alan',
                'last_name' => 'Turing',
                'gender' => 'Male',
                'department' => 'CS Department',
                'rank' => 'Professor',
                'employment_status' => 'Full-time',
                'date_hired' => '2015-06-01',
            ]
        );
    }
}

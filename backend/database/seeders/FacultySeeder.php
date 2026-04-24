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
        $user = User::create([
            'name' => 'Dr. Alan Turing',
            'email' => 'turing@faculty.edu',
            'password' => Hash::make('password'),
            'role' => 'faculty',
            'status' => 'approved',
            'must_change_password' => false,
        ]);

        Faculty::create([
            'user_id' => $user->id,
            'id_number' => 'EMP-101',
            'first_name' => 'Alan',
            'last_name' => 'Turing',
            'gender' => 'Male',
            'department' => 'CS Department',
            'rank' => 'Professor',
            'employment_status' => 'Full-time',
            'email' => 'turing@faculty.edu',
            'date_hired' => '2015-06-01',
        ]);
    }
}

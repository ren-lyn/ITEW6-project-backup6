<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            [
                'user' => [
                    'name' => 'John Doe',
                    'email' => 'john@student.edu',
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'status' => 'approved'
                ],
                'student' => [
                    'first_name' => 'John',
                    'last_name' => 'Doe',
                    'nickname' => 'Johnny',
                    'gender' => 'Male',
                    'birthdate' => '2004-05-15',
                    'civil_status' => 'Single',
                    'nationality' => 'Filipino',
                    'present_address' => 'Cabuyao City, Laguna',
                    'permanent_address' => 'Cabuyao City, Laguna',
                    'contact_number' => '09123456789',
                    'email' => 'john@student.edu',
                ],
                'guardian' => [
                    'father_name' => 'Robert Doe',
                    'father_occupation' => 'Engineer',
                    'mother_name' => 'Mary Doe',
                    'mother_occupation' => 'Teacher',
                    'emergency_contact' => '09123456780',
                    'living_status' => 'Living with parents',
                ],
                'academic' => [
                    'course' => 'BSCS',
                    'year_level' => 3,
                    'section' => 'A',
                    'gwa' => 1.25,
                    'academic_standing' => 'Regular',
                    'dean_list' => true,
                    'scholarship' => 'Full Scholar',
                ]
            ],
            [
                'user' => [
                    'name' => 'Jane Smith',
                    'email' => 'jane@student.edu',
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'status' => 'approved'
                ],
                'student' => [
                    'first_name' => 'Jane',
                    'last_name' => 'Smith',
                    'nickname' => 'Janie',
                    'gender' => 'Female',
                    'birthdate' => '2005-08-20',
                    'civil_status' => 'Single',
                    'nationality' => 'Filipino',
                    'present_address' => 'Santa Rosa City, Laguna',
                    'permanent_address' => 'Santa Rosa City, Laguna',
                    'contact_number' => '09987654321',
                    'email' => 'jane@student.edu',
                ],
                'guardian' => [
                    'father_name' => 'Paul Smith',
                    'father_occupation' => 'Technician',
                    'mother_name' => 'Sarah Smith',
                    'mother_occupation' => 'Nurse',
                    'emergency_contact' => '09987654320',
                    'living_status' => 'Boarding',
                ],
                'academic' => [
                    'course' => 'BSIT',
                    'year_level' => 2,
                    'section' => 'B',
                    'gwa' => 1.75,
                    'academic_standing' => 'Regular',
                    'dean_list' => false,
                ]
            ],
        ];

        foreach ($students as $data) {
            $userData = $data['user'];
            $userData['must_change_password'] = false;
            $user = User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            $studentData = $data['student'];
            $studentData['user_id'] = $user->id;
            $student = Student::updateOrCreate(
                ['email' => $studentData['email']],
                $studentData
            );

            if (isset($data['guardian'])) {
                $student->guardians()->create($data['guardian']);
            }

            if (isset($data['academic'])) {
                $student->academicRecords()->create($data['academic']);
            }
        }
    }
}

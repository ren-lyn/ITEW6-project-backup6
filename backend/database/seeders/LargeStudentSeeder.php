<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use App\Models\Guardian;
use App\Models\PhysicalProfile;
use App\Models\AcademicRecord;
use App\Models\Skill;
use App\Models\Talent;
use App\Models\Achievement;
use App\Models\Violation;
use App\Models\Event;
use App\Models\MedicalRecord;
use App\Models\BehavioralProfile;
use App\Models\Organization;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class LargeStudentSeeder extends Seeder
{
    /**
     * Seed 1000 complete student profiles.
     */
    public function run(): void
    {
        // For a clean demo state, we clear existing demo students first.
        // This prevents unique constraint violations from previous partial/failed runs.
        User::where('email', 'like', '%@ccs.edu')->where('role', 'student')->forceDelete();

        $faker = Faker::create();
        $skills = Skill::all();
        $talents = Talent::all();
        $events = Event::all();
        
        // Ensure some organizations exist
        $orgNames = ['CCS Student Council', 'Programming Club', 'Junior IT Professionals', 'E-Sports League', 'Cultural Dance Troupe'];
        foreach ($orgNames as $orgName) {
            Organization::firstOrCreate(['org_name' => $orgName]);
        }
        $orgs = Organization::all();

        // Use a transaction for speed and integrity if possible, 
        // but for 1000 records with many relations, we'll just loop.
        
        $this->command->getOutput()->progressStart(500);

        for ($i = 0; $i < 500; $i++) {
            // Generate deterministic email for this index
            // We use a fixed first/last name pattern for the index to ensure consistency across runs
            $email = "student.demo.{$i}@ccs.edu";
            
            // SKIP if this specific student already exists
            if (User::where('email', $email)->exists()) {
                $this->command->getOutput()->progressAdvance();
                continue;
            }

            // 1. Create User
            $firstName = $faker->firstName;
            $lastName = $faker->lastName;
            
            $user = User::create([
                'name' => $firstName . ' ' . $lastName,
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'student',
                'status' => 'approved',
            ]);

            // 2. Create Student
            $yearLevel = $faker->numberBetween(1, 4);
            $course = $faker->randomElement(['BSIT', 'BSCS', 'BSIS']);
            
            $student = Student::create([
                'user_id' => $user->id,
                'first_name' => $firstName,
                'last_name' => $lastName,
                'nickname' => $firstName,
                'gender' => $faker->randomElement(['Male', 'Female']),
                'birthdate' => $faker->date('Y-m-d', '2005-01-01'),
                'civil_status' => 'Single',
                'nationality' => 'Filipino',
                'religion' => $faker->randomElement(['Roman Catholic', 'Christian', 'Iglesia ni Cristo', 'Islam']),
                'contact_number' => $faker->phoneNumber,
                'email' => $email,
                'present_address' => $faker->address,
                'permanent_address' => $faker->address,
                'profile_submitted' => true,
                'profile_submitted_at' => now(),
                'id_number' => (2022 + ($i % 5)) . '-' . sprintf('%04d', $i + 1),
            ]);

            // 3. Create Guardian
            Guardian::create([
                'student_id' => $student->student_id,
                'father_name' => $faker->name('male'),
                'guardian_name' => $faker->name,
                'emergency_contact' => $faker->phoneNumber,
                'family_income_bracket' => $faker->randomElement(['Below 10,000', '10,000 - 20,000', '20,000 - 40,000', '40,000 - 70,000']),
                'living_status' => $faker->randomElement(['Living with Parents', 'Boarding House', 'Dormitory']),
            ]);

            // 4. Create Physical Profile
            PhysicalProfile::create([
                'student_id' => $student->student_id,
                'height' => $faker->numberBetween(150, 190),
                'weight' => $faker->numberBetween(45, 100),
                'body_measurements' => $faker->randomElement(['Ectomorph', 'Mesomorph', 'Endomorph']),
                'image_presence' => true,
            ]);

            // 5. Create Academic Records
            AcademicRecord::create([
                'student_id' => $student->student_id,
                'course' => $course,
                'year_level' => $yearLevel,
                'semester' => '1st Semester',
                'gwa' => $faker->randomFloat(2, 1.0, 3.0),
                'academic_standing' => 'Regular',
                'section' => $faker->randomElement(['A', 'B', 'C', 'D']),
            ]);

            // 6. Attach Skills & Talents (Using syncWithoutDetaching for safety)
            if ($skills->isNotEmpty()) {
                $randomSkills = $skills->random(rand(2, 4));
                foreach ($randomSkills as $skill) {
                    $student->skills()->syncWithoutDetaching([$skill->skill_id => ['proficiency_level' => rand(1, 5)]]);
                }
            }
            
            if ($talents->isNotEmpty()) {
                $student->talents()->syncWithoutDetaching($talents->random(rand(1, 2))->pluck('talent_id')->toArray());
            }

            // 7. Medical & Behavioral
            MedicalRecord::create([
                'student_id' => $student->student_id,
                'blood_type' => $faker->randomElement(['A+', 'B+', 'O+', 'AB+']),
                'emergency_name' => $faker->name,
                'emergency_contact' => $faker->phoneNumber,
            ]);

            BehavioralProfile::create([
                'student_id' => $student->student_id,
                'punctuality_rating' => round($faker->randomFloat(1, 3, 5)),
                'personality_type' => $faker->randomElement(['Introvert', 'Extrovert', 'Ambivert']),
            ]);

            $this->command->getOutput()->progressAdvance();
        }

        $this->command->getOutput()->progressFinish();
    }
}

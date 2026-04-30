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
        // Safety check: Skip if we already have a large number of seeded students
        if (User::where('email', 'like', '%@ccs.edu')->where('role', 'student')->count() >= 1000) {
            return;
        }

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
        
        $this->command->getOutput()->progressStart(1000);

        for ($i = 0; $i < 1000; $i++) {
            // 1. Create User
            $firstName = $faker->firstName;
            $lastName = $faker->lastName;
            $email = strtolower($firstName . '.' . $lastName . '.' . $i . '@ccs.edu');
            
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
                
                // Educational Background
                'elementary_school' => $faker->company . ' Elementary School',
                'elementary_year_graduated' => '2016',
                'elementary_awards' => $faker->randomElement(['None', 'With Honors', 'Valedictorian']),
                'junior_high_school' => $faker->company . ' High School',
                'junior_high_year_graduated' => '2020',
                'junior_high_awards' => $faker->randomElement(['None', 'With High Honors', 'Leadership Award']),
                'senior_high_school' => $faker->company . ' Senior High',
                'senior_high_year_graduated' => '2022',
                'senior_high_awards' => $faker->randomElement(['None', 'With Honors', 'STEM Excellence']),
                
                // Medical History
                'blood_type' => $faker->randomElement(['A+', 'B+', 'O+', 'AB+']),
                'medical_history' => $faker->boolean(20) ? $faker->sentence : 'No significant medical history.',
                'allergies' => $faker->boolean(20) ? $faker->word : 'None',
                'medications' => $faker->boolean(10) ? $faker->word : 'None',
                
                'profile_submitted' => true,
                'profile_submitted_at' => now(),
                'id_number' => '202' . $faker->numberBetween(2, 6) . '-' . sprintf('%04d', $i + 1),
            ]);

            // 3. Create Guardian
            Guardian::create([
                'student_id' => $student->student_id,
                'father_name' => $faker->name('male'),
                'father_occupation' => $faker->jobTitle,
                'father_contact' => $faker->phoneNumber,
                'mother_name' => $faker->name('female'),
                'mother_occupation' => $faker->jobTitle,
                'mother_contact' => $faker->phoneNumber,
                'guardian_name' => $faker->name,
                'guardian_contact' => $faker->phoneNumber,
                'emergency_contact' => $faker->phoneNumber,
                'family_income_bracket' => $faker->randomElement(['Below 10,000', '10,000 - 20,000', '20,000 - 40,000', '40,000 - 70,000']),
                'living_status' => $faker->randomElement(['Living with Parents', 'Boarding House', 'Dormitory', 'Living with Relatives']),
            ]);

            // 4. Create Physical Profile
            PhysicalProfile::create([
                'student_id' => $student->student_id,
                'height' => $faker->numberBetween(150, 190),
                'weight' => $faker->numberBetween(45, 100),
                'body_measurements' => $faker->randomElement(['Ectomorph', 'Mesomorph', 'Endomorph']),
                'image_presence' => true,
            ]);

            // 5. Create Academic Records (Historical)
            // Generate records for all previous semesters based on current year level
            for ($year = 1; $year <= $yearLevel; $year++) {
                // For the current year, we only add the 1st semester as "Current" or "Active"
                // For previous years, we add both 1st and 2nd semesters
                $semsToGen = ($year < $yearLevel) ? [1, 2] : [1];
                
                foreach ($semsToGen as $sem) {
                    AcademicRecord::create([
                        'student_id' => $student->student_id,
                        'course' => $course,
                        'year_level' => $year,
                        'semester' => $sem . ($sem == 1 ? 'st' : 'nd') . ' Semester',
                        'gwa' => $faker->randomFloat(2, 1.0, 3.0),
                        'academic_standing' => 'Regular',
                        'section' => $faker->randomElement(['A', 'B', 'C', 'D']),
                    ]);
                }
            }

            // 6. Attach Skills & Talents
            if ($skills->isNotEmpty()) {
                $randomSkills = $skills->random(rand(2, 6));
                foreach ($randomSkills as $skill) {
                    $student->skills()->attach($skill->skill_id, ['proficiency_level' => rand(1, 5)]);
                }
            }
            
            if ($talents->isNotEmpty()) {
                $student->talents()->attach($talents->random(rand(1, 3))->pluck('talent_id')->toArray());
            }

            // 7. Non-Academic (Achievements & Events)
            if ($faker->boolean(30)) {
                Achievement::create([
                    'student_id' => $student->student_id,
                    'title' => $faker->randomElement(['Dean\'s Lister', 'Programming Competition Finalist', 'Math Quiz Bee Winner', 'Service Award']),
                    'category' => 'Academic/Co-curricular',
                    'date_awarded' => $faker->date(),
                    'recognition_level' => $faker->randomElement(['College', 'University', 'Regional']),
                ]);
            }
            
            if ($events->isNotEmpty() && $faker->boolean(50)) {
                $eventCount = min(2, $events->count());
                $student->participatingEvents()->attach(
                    $events->random(rand(1, $eventCount))->pluck('event_id')->toArray(), 
                    ['role' => $faker->randomElement(['Participant', 'Volunteer', 'Organizer'])]
                );
            }

            // 8. Violations
            if ($faker->boolean(8)) {
                Violation::create([
                    'student_id' => $student->student_id,
                    'violation_type' => $faker->randomElement(['Unexcused Absence', 'Minor Misconduct', 'Dress Code Violation']),
                    'severity_level' => 'Minor',
                    'violation_date' => $faker->date(),
                    'case_status' => 'Resolved',
                ]);
            }

            // 9. Medical Records
            MedicalRecord::create([
                'student_id' => $student->student_id,
                'blood_type' => $faker->randomElement(['A+', 'B+', 'O+', 'AB+']),
                'allergies' => $faker->randomElement(['None', 'Peanuts', 'Dust', 'Lactose', 'Seafood']),
                'chronic_illness' => $faker->randomElement(['None', 'Asthma', 'Diabetes', 'Hypertension']),
                'disability' => $faker->randomElement(['None', 'None', 'None', 'Visual Impairment']),
                'emergency_name' => $faker->name,
                'emergency_contact' => $faker->phoneNumber,
            ]);

            // 10. Behavioral Profile
            BehavioralProfile::create([
                'student_id' => $student->student_id,
                'punctuality_rating' => round($faker->randomFloat(1, 3, 5)),
                'personality_type' => $faker->randomElement(['Introvert', 'Extrovert', 'Ambivert']),
                'behavioral_remarks' => $faker->sentence(),
            ]);

            // 11. Organizations (Affiliations)
            if ($orgs->isNotEmpty() && $faker->boolean(60)) {
                $randomOrgs = $orgs->random(rand(1, 2));
                foreach ($randomOrgs as $org) {
                    $student->organizations()->attach($org->org_id, [
                        'position' => $faker->randomElement(['Member', 'Officer', 'President', 'Secretary']),
                        'years_active' => '2023-2024'
                    ]);
                }
            }

            $this->command->getOutput()->progressAdvance();
        }

        $this->command->getOutput()->progressFinish();
    }
}

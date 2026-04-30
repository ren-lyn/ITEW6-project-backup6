<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ComprehensiveProfilingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = \App\Models\Student::all();
        $faker = \Faker\Factory::create();

        foreach ($students as $student) {
            // Physical Profile
            $height = $faker->numberBetween(150, 190);
            $weight = $faker->numberBetween(45, 100);
            $bmi = round($weight / (($height / 100) ** 2), 1);
            
            \App\Models\PhysicalProfile::updateOrCreate(
                ['student_id' => $student->student_id],
                [
                    'height' => $height,
                    'weight' => $weight,
                    'bmi' => $bmi,
                    'body_measurements' => $faker->randomElement(['Ectomorph', 'Mesomorph', 'Endomorph']),
                    'image_presence' => $faker->boolean(80),
                ]
            );

            // Medical Record
            \App\Models\MedicalRecord::updateOrCreate(
                ['student_id' => $student->student_id],
                [
                    'blood_type' => $faker->randomElement(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']),
                    'allergies' => $faker->randomElement(['None', 'Peanuts', 'Dust', 'Lactose', 'Seafood']),
                    'chronic_illness' => $faker->randomElement(['None', 'Asthma', 'Diabetes', 'Hypertension']),
                    'disability' => $faker->randomElement(['None', 'None', 'None', 'Visual Impairment', 'Hearing Impairment']),
                    'emergency_name' => $faker->name,
                    'emergency_contact' => $faker->phoneNumber,
                ]
            );

            // Behavioral Profile
            \App\Models\BehavioralProfile::updateOrCreate(
                ['student_id' => $student->student_id],
                [

                    'punctuality_rating' => round($faker->randomFloat(1, 1, 5)),
                    'personality_type' => $faker->randomElement(['Introvert', 'Extrovert', 'Ambivert']),
                    'behavioral_remarks' => $faker->sentence(),
                ]
            );
        }
    }
}

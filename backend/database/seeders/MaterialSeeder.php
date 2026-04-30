<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Material;
use App\Models\Faculty;

class MaterialSeeder extends Seeder
{
    public function run(): void
    {
        $faculty = Faculty::first();

        Material::updateOrCreate(
            ['title' => 'Advanced Database Systems Syllabus'],
            [
                'faculty_id' => $faculty ? $faculty->faculty_id : null,
                'type' => 'Syllabus',
                'subject_code' => 'IT-311',
                'description' => 'Comprehensive syllabus for IT-311 covering NoSQL and Distributed Databases.',
                'syllabus_json' => [
                    'outcomes' => ['Understand CAP theorem', 'Implement MongoDB clusters'],
                    'weekly_topics' => ['Week 1: Intro to NoSQL', 'Week 2: MongoDB Basics'],
                    'assessment_methods' => ['Quizzes: 20%', 'Final Project: 40%']
                ]
            ]
        );

        Material::updateOrCreate(
            ['title' => 'Data Structures Course Pack'],
            [
                'faculty_id' => $faculty ? $faculty->faculty_id : null,
                'type' => 'Course Pack',
                'subject_code' => 'CS-211',
                'description' => 'A complete guide to fundamental data structures and algorithm analysis.',
                'curriculum_json' => [
                    'course_guide' => 'Standard CS curriculum 2024 revision.',
                    'pre_requisites' => 'CS-111 Introduction to Programming'
                ]
            ]
        );
    }
}

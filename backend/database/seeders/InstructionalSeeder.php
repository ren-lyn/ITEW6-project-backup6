<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Syllabus;
use App\Models\Lesson;

class InstructionalSeeder extends Seeder
{
    public function run(): void
    {
        $faculty = Faculty::first();

        $course = Course::updateOrCreate(
            ['course_code' => 'IT-311'],
            [
                'course_title' => 'Advanced Database Systems',
                'description' => 'Focuses on non-relational databases and distributed data management.'
            ]
        );

        $syllabus = Syllabus::updateOrCreate(
            ['course_id' => $course->course_id],
            [
                'faculty_id' => $faculty ? $faculty->faculty_id : null,
                'learning_outcomes' => "1. Understand NoSQL paradigms\n2. Design scalable distributed systems",
                'assessment_methods' => "Quizzes: 30%, Final Project: 70%"
            ]
        );

        Lesson::updateOrCreate(
            ['syllabus_id' => $syllabus->syllabus_id, 'lesson_title' => 'Introduction to NoSQL'],
            [
                'objectives' => 'Differentiate between RDBMS and NoSQL',
                'materials' => 'Lecture slides, MongoDB Atlas account',
                'assignments' => 'Create a free Mongo cluster'
            ]
        );

        Lesson::updateOrCreate(
            ['syllabus_id' => $syllabus->syllabus_id, 'lesson_title' => 'The CAP Theorem'],
            [
                'objectives' => 'Understand trade-offs in distributed systems',
                'materials' => 'Reading list on distributed systems',
                'assignments' => 'Analysis paper on Consistency vs Availability'
            ]
        );
    }
}

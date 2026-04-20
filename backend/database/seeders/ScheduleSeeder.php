<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Schedule;
use App\Models\Faculty;
use App\Models\Event;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $faculty = Faculty::first();
        $event = Event::first();

        // 1st Year 1st Sem
        $it1a = [
            ['title' => 'Introduction to Computing', 'code' => 'CCS101', 'days' => 'Monday', 'start' => '08:00:00', 'end' => '11:00:00', 'room' => 'CCS-101', 'year' => '1'],
            ['title' => 'Computer Programming 1', 'code' => 'CCS102', 'days' => 'Tuesday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CCS-Lab1', 'year' => '1'],
            ['title' => 'Mathematics in the Modern World', 'code' => 'MAT101', 'days' => 'Wednesday', 'start' => '09:00:00', 'end' => '12:00:00', 'room' => 'CAS-203', 'year' => '1'],
            ['title' => 'National Service Training Program 1', 'code' => 'NSTP1', 'days' => 'Saturday', 'start' => '08:00:00', 'end' => '11:00:00', 'room' => 'Field', 'year' => '1'],
            ['title' => 'Physical Activities Toward Health and Fitness 1', 'code' => 'PED101', 'days' => 'Thursday', 'start' => '15:00:00', 'end' => '17:00:00', 'room' => 'Gym', 'year' => '1'],
            ['title' => 'PnCians Holistic Development 1', 'code' => 'PHD101', 'days' => 'Friday', 'start' => '10:00:00', 'end' => '11:00:00', 'room' => 'Auditorium', 'year' => '1'],
            ['title' => 'Understanding the Self', 'code' => 'PSY100', 'days' => 'Monday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CAS-105', 'year' => '1'],
            ['title' => 'Science and Development of Reading', 'code' => 'READ100', 'days' => 'Thursday', 'start' => '08:00:00', 'end' => '11:00:00', 'room' => 'CAS-301', 'year' => '1'],
        ];

        // 2nd Year 1st Sem
        $it2a = [
            ['title' => 'Human Computer Interaction 1', 'code' => 'CCS105', 'days' => 'Monday', 'start' => '09:00:00', 'end' => '12:00:00', 'room' => 'CCS-Lab2', 'year' => '2'],
            ['title' => 'Data Structures and Algorithms', 'code' => 'CCS107', 'days' => 'Tuesday', 'start' => '08:00:00', 'end' => '11:00:00', 'room' => 'CCS-Lab3', 'year' => '2'],
            ['title' => 'The Entrepreneurial Mind', 'code' => 'ENT101', 'days' => 'Wednesday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CAS-202', 'year' => '2'],
            ['title' => 'Ethics', 'code' => 'ETH101', 'days' => 'Thursday', 'start' => '09:00:00', 'end' => '12:00:00', 'room' => 'CAS-305', 'year' => '2'],
            ['title' => 'Responsive Web Design', 'code' => 'ITEW1', 'days' => 'Friday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CCS-Lab1', 'year' => '2'],
            ['title' => 'Physical Activities Toward Health and Fitness 3', 'code' => 'PED103', 'days' => 'Saturday', 'start' => '15:00:00', 'end' => '17:00:00', 'room' => 'Gym', 'year' => '2'],
            ['title' => 'Life and Works of Rizal', 'code' => 'RIZ101', 'days' => 'Tuesday', 'start' => '14:00:00', 'end' => '17:00:00', 'room' => 'CAS-101', 'year' => '2'],
            ['title' => 'The Contemporary World', 'code' => 'SOC101', 'days' => 'Wednesday', 'start' => '08:00:00', 'end' => '11:00:00', 'room' => 'CAS-206', 'year' => '2'],
            ['title' => 'Science, Technology and Society', 'code' => 'STS101', 'days' => 'Friday', 'start' => '09:00:00', 'end' => '12:00:00', 'room' => 'CAS-302', 'year' => '2'],
        ];

        // 3rd Year 1st Sem
        $it3a = [
            ['title' => 'System Analysis and Design', 'code' => 'CCS109', 'days' => 'Monday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CCS-205', 'year' => '3'],
            ['title' => 'Networking and Communication 1', 'code' => 'CCS111', 'days' => 'Tuesday', 'start' => '08:00:00', 'end' => '11:00:00', 'room' => 'CCS-Lab4', 'year' => '3'],
            ['title' => 'Mobile Programming 1', 'code' => 'ITEW3', 'days' => 'Wednesday', 'start' => '09:00:00', 'end' => '12:00:00', 'room' => 'CCS-Lab2', 'year' => '3'],
            ['title' => 'System Integration and Architecture', 'code' => 'ITP103', 'days' => 'Thursday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CCS-201', 'year' => '3'],
            ['title' => 'Information Management System 2', 'code' => 'ITP104', 'days' => 'Friday', 'start' => '08:00:00', 'end' => '11:00:00', 'room' => 'CCS-Lab1', 'year' => '3'],
            ['title' => 'Mobile Application Development', 'code' => 'ITP107', 'days' => 'Saturday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CCS-Lab3', 'year' => '3'],
        ];

        // 4th Year 1st Sem
        $it4a = [
            ['title' => 'System Administration and Maintenance', 'code' => 'ITP111', 'days' => 'Monday', 'start' => '09:00:00', 'end' => '12:00:00', 'room' => 'CCS-Lab5', 'year' => '4'],
            ['title' => 'Capstone Project 2', 'code' => 'ITP112', 'days' => 'Wednesday', 'start' => '13:00:00', 'end' => '16:00:00', 'room' => 'CCS-102', 'year' => '4'],
        ];

        $curriculums = [
            ['section' => 'IT1A', 'classes' => $it1a],
            ['section' => 'IT2A', 'classes' => $it2a],
            ['section' => 'IT3A', 'classes' => $it3a],
            ['section' => 'IT4A', 'classes' => $it4a],
        ];

        foreach ($curriculums as $curr) {
            foreach ($curr['classes'] as $subject) {
                Schedule::create([
                    'faculty_id' => $faculty ? $faculty->faculty_id : null,
                    'title' => $subject['title'],
                    'subject_code' => $subject['code'],
                    'days_of_week' => $subject['days'],
                    'start_time' => $subject['start'],
                    'end_time' => $subject['end'],
                    'room_assignment' => $subject['room'],
                    'section' => $curr['section'],
                    'year_level' => $subject['year'],
                    'schedule_type' => 'Class'
                ]);
            }
        }

        Schedule::create([
            'event_id' => $event ? $event->event_id : null,
            'title' => $event ? $event->event_name : 'Search for Mr. and Ms. CCS',
            'room_assignment' => 'University Gym',
            'days_of_week' => 'Sunday',
            'start_time' => '13:00:00',
            'end_time' => '17:00:00',
            'schedule_type' => 'Event'
        ]);
    }
}

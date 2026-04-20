<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        Event::create([
            'name' => 'CCS Pageant 2026',
            'event_type' => 'Special Event',
            'description' => 'The annual search for Mr. and Ms. CCS.',
            'event_date' => '2026-03-15',
            'location' => 'University Gymnasium',
            'organizer' => 'CCS Council',
        ]);

        Event::create([
            'name' => 'IT Skills Competition',
            'event_type' => 'Competition',
            'description' => 'A showcase of programming and design skills.',
            'event_date' => '2026-04-05',
            'location' => 'CCS Lab 1',
            'organizer' => 'IT Department',
        ]);
    }
}

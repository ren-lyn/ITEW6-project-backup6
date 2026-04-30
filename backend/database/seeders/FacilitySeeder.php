<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Facility;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        Facility::updateOrCreate(
            ['name' => 'CCS Lab 1'],
            [
                'type' => 'Computer Lab',
                'capacity' => 45,
                'equipment_json' => ['Desktop PCs: 50', 'Projector: 1', 'AC: 2'],
                'status' => 'Available'
            ]
        );

        Facility::updateOrCreate(
            ['name' => 'Lecture Room 302'],
            [
                'type' => 'Lecture Room',
                'capacity' => 40,
                'equipment_json' => ['Whiteboard: 1', 'Smart TV: 1'],
                'status' => 'Reserved'
            ]
        );

        Facility::updateOrCreate(
            ['name' => 'Studio A'],
            [
                'type' => 'Production Studio',
                'capacity' => 15,
                'equipment_json' => ['Cameras: 3', 'Green Screen: 1', 'Sound Mixer: 1'],
                'status' => 'Maintenance'
            ]
        );
    }
}

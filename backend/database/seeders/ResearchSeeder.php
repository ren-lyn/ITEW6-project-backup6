<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Research;

class ResearchSeeder extends Seeder
{
    public function run(): void
    {
        $faculty = \App\Models\Faculty::first();

        \App\Models\Research::updateOrCreate(
            ['title' => 'Blockchain-based Academic Credentialing'],
            [
                'abstract' => 'A decentralized approach to verifying university diplomas using Ethereum smart contracts.',
                'category' => 'Blockchain',
                'publication_year' => 2024,
                'adviser_id' => $faculty ? $faculty->faculty_id : null,
            ]
        );

        \App\Models\Research::updateOrCreate(
            ['title' => 'AI-Driven Career Path Recommendation'],
            [
                'abstract' => 'Using machine learning to match student profiles with optimal industry trajectories.',
                'category' => 'Artificial Intelligence',
                'publication_year' => 2025,
                'adviser_id' => $faculty ? $faculty->faculty_id : null,
            ]
        );
    }
}

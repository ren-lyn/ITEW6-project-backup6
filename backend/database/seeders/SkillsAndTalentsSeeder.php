<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Skill;
use App\Models\Talent;

class SkillsAndTalentsSeeder extends Seeder
{
    /**
     * Seed predefined skills and talents for student profiling.
     */
    public function run(): void
    {
        $skills = [
            // Technical Skills
            ['skill_name' => 'Programming', 'skill_type' => 'Technical'],
            ['skill_name' => 'Web Development', 'skill_type' => 'Technical'],
            ['skill_name' => 'Mobile App Development', 'skill_type' => 'Technical'],
            ['skill_name' => 'Database Management', 'skill_type' => 'Technical'],
            ['skill_name' => 'Networking', 'skill_type' => 'Technical'],
            ['skill_name' => 'Cybersecurity', 'skill_type' => 'Technical'],
            ['skill_name' => 'Data Analytics', 'skill_type' => 'Technical'],
            ['skill_name' => 'UI/UX Design', 'skill_type' => 'Technical'],
            ['skill_name' => 'Cloud Computing', 'skill_type' => 'Technical'],
            ['skill_name' => 'Machine Learning / AI', 'skill_type' => 'Technical'],
            ['skill_name' => 'Game Development', 'skill_type' => 'Technical'],
            ['skill_name' => 'System Administration', 'skill_type' => 'Technical'],

            // Soft Skills
            ['skill_name' => 'Leadership', 'skill_type' => 'Soft Skill'],
            ['skill_name' => 'Communication', 'skill_type' => 'Soft Skill'],
            ['skill_name' => 'Teamwork', 'skill_type' => 'Soft Skill'],
            ['skill_name' => 'Problem Solving', 'skill_type' => 'Soft Skill'],
            ['skill_name' => 'Critical Thinking', 'skill_type' => 'Soft Skill'],
            ['skill_name' => 'Time Management', 'skill_type' => 'Soft Skill'],
            ['skill_name' => 'Public Speaking', 'skill_type' => 'Soft Skill'],
            ['skill_name' => 'Research & Writing', 'skill_type' => 'Soft Skill'],

            // Tools & Platforms
            ['skill_name' => 'Microsoft Office', 'skill_type' => 'Tools'],
            ['skill_name' => 'Adobe Creative Suite', 'skill_type' => 'Tools'],
            ['skill_name' => 'Figma / Canva', 'skill_type' => 'Tools'],
            ['skill_name' => 'Git / Version Control', 'skill_type' => 'Tools'],
        ];

        foreach ($skills as $skill) {
            Skill::updateOrCreate(['skill_name' => $skill['skill_name']], $skill);
        }

        $talents = [
            ['talent_name' => 'Singing'],
            ['talent_name' => 'Dancing'],
            ['talent_name' => 'Acting / Theater'],
            ['talent_name' => 'Drawing / Painting'],
            ['talent_name' => 'Photography'],
            ['talent_name' => 'Videography / Filmmaking'],
            ['talent_name' => 'Creative Writing'],
            ['talent_name' => 'Musical Instrument'],
            ['talent_name' => 'Sports / Athletics'],
            ['talent_name' => 'Cooking / Baking'],
            ['talent_name' => 'Graphic Design'],
            ['talent_name' => 'Content Creation'],
            ['talent_name' => 'Debate / Oratory'],
            ['talent_name' => 'Robotics / Electronics'],
            ['talent_name' => 'Cosplay / Crafts'],
        ];

        foreach ($talents as $talent) {
            Talent::updateOrCreate(['talent_name' => $talent['talent_name']], $talent);
        }
    }
}

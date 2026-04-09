<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            // Student Documents
            [
                'name' => 'PSA Birth Certificate',
                'description' => 'Original or certified true copy of Birth Certificate issued by PSA.',
                'is_mandatory' => true,
                'required_for_role' => 'student',
            ],
            [
                'name' => 'Form 137 / TOR',
                'description' => 'Official Transcript of Records or Form 137 from previous school.',
                'is_mandatory' => true,
                'required_for_role' => 'student',
            ],
            [
                'name' => 'Certificate of Good Moral',
                'description' => 'Issued by the previous school principal or dean.',
                'is_mandatory' => true,
                'required_for_role' => 'student',
            ],
            // Faculty Documents
            [
                'name' => 'PRC License',
                'description' => 'Professional Identification Card from PRC.',
                'is_mandatory' => true,
                'required_for_role' => 'faculty',
                'requires_expiry_date' => true,
            ],
            [
                'name' => 'Post-Graduate Diploma',
                'description' => 'Master\'s or Doctorate Degree Diploma.',
                'is_mandatory' => false,
                'required_for_role' => 'faculty',
            ],
            // Both
            [
                'name' => 'Medical Certificate',
                'description' => 'Recent health clearance from a licensed physician.',
                'is_mandatory' => true,
                'required_for_role' => 'both',
            ],
        ];

        foreach ($types as $type) {
            \App\Models\DocumentType::updateOrCreate(['name' => $type['name']], $type);
        }
    }
}

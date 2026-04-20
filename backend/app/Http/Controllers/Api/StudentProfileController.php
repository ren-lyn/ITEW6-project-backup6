<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\Guardian;
use App\Models\PhysicalProfile;
use App\Models\Skill;
use App\Models\Talent;
use App\Models\DocumentSubmission;
use Illuminate\Support\Facades\Storage;

class StudentProfileController extends Controller
{
    /**
     * Get comprehensive student profile data for the My Profile page.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student record not found'], 404);
        }

        $student->load([
            'guardians',
            'physicalProfile',
            'skills',
            'talents',
        ]);

        // Get all available skills and talents for the checklist
        $allSkills = Skill::all();
        $allTalents = Talent::all();

        // Get student's selected skill/talent IDs
        $studentSkillIds = $student->skills->pluck('skill_id')->toArray();
        $studentTalentIds = $student->talents->pluck('talent_id')->toArray();

        // Get document submissions for this user
        $documents = DocumentSubmission::where('user_id', $user->id)
            ->with('type')
            ->get()
            ->map(function ($doc) {
                return [
                    'id' => $doc->id,
                    'document_type_id' => $doc->document_type_id,
                    'type_name' => $doc->type->name ?? 'Unknown',
                    'original_filename' => $doc->original_filename,
                    'file_path' => $doc->file_path ? url('storage/' . $doc->file_path) : null,
                    'status' => $doc->status,
                    'created_at' => $doc->created_at,
                ];
            });

        return response()->json([
            'student' => $student,
            'user' => $user,
            'guardian' => $student->guardians,
            'physical_profile' => $student->physicalProfile,
            'all_skills' => $allSkills,
            'all_talents' => $allTalents,
            'student_skill_ids' => $studentSkillIds,
            'student_talent_ids' => $studentTalentIds,
            'documents' => $documents,
            'profile_submitted' => (bool) $student->profile_submitted,
        ]);
    }

    /**
     * Submit the full student profile. Can only be done once.
     * After submission, profile fields are locked (except document uploads).
     */
    public function submitProfile(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student record not found'], 404);
        }

        // Check if already submitted
        if ($student->profile_submitted) {
            return response()->json(['message' => 'Profile has already been submitted and cannot be edited.'], 403);
        }

        $validated = $request->validate([
            // Personal Information
            'nickname' => 'nullable|string|max:100',
            'gender' => 'nullable|string|max:10',
            'birthdate' => 'nullable|date',
            'civil_status' => 'nullable|string|max:20',
            'nationality' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',

            // Contact Information
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|string|email|max:100',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',

            // Family Background
            'father_name' => 'nullable|string|max:100',
            'father_occupation' => 'nullable|string|max:100',
            'father_contact' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:100',
            'mother_occupation' => 'nullable|string|max:100',
            'mother_contact' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_contact' => 'nullable|string|max:20',
            'emergency_contact' => 'nullable|string|max:20',
            'family_income_bracket' => 'nullable|string|max:50',
            'living_status' => 'nullable|string|max:50',

            // Educational Background
            'elementary_school' => 'nullable|string|max:255',
            'elementary_year_graduated' => 'nullable|string|max:10',
            'elementary_awards' => 'nullable|string',
            'junior_high_school' => 'nullable|string|max:255',
            'junior_high_year_graduated' => 'nullable|string|max:10',
            'junior_high_awards' => 'nullable|string',
            'senior_high_school' => 'nullable|string|max:255',
            'senior_high_year_graduated' => 'nullable|string|max:10',
            'senior_high_awards' => 'nullable|string',

            // Physical Profile (height & weight)
            'height' => 'nullable|numeric|min:0|max:300',
            'weight' => 'nullable|numeric|min:0|max:500',

            // Skills & Talents (arrays of IDs)
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'integer|exists:skills,skill_id',
            'talent_ids' => 'nullable|array',
            'talent_ids.*' => 'integer|exists:talents,talent_id',
        ]);

        // Update student personal + contact + educational fields
        $student->update([
            'nickname' => $validated['nickname'] ?? $student->nickname,
            'gender' => $validated['gender'] ?? $student->gender,
            'birthdate' => $validated['birthdate'] ?? $student->birthdate,
            'civil_status' => $validated['civil_status'] ?? $student->civil_status,
            'nationality' => $validated['nationality'] ?? $student->nationality,
            'religion' => $validated['religion'] ?? $student->religion,
            'contact_number' => $validated['contact_number'] ?? $student->contact_number,
            'email' => $validated['email'] ?? $student->email,
            'present_address' => $validated['present_address'] ?? $student->present_address,
            'permanent_address' => $validated['permanent_address'] ?? $student->permanent_address,
            'elementary_school' => $validated['elementary_school'] ?? $student->elementary_school,
            'elementary_year_graduated' => $validated['elementary_year_graduated'] ?? $student->elementary_year_graduated,
            'elementary_awards' => $validated['elementary_awards'] ?? $student->elementary_awards,
            'junior_high_school' => $validated['junior_high_school'] ?? $student->junior_high_school,
            'junior_high_year_graduated' => $validated['junior_high_year_graduated'] ?? $student->junior_high_year_graduated,
            'junior_high_awards' => $validated['junior_high_awards'] ?? $student->junior_high_awards,
            'senior_high_school' => $validated['senior_high_school'] ?? $student->senior_high_school,
            'senior_high_year_graduated' => $validated['senior_high_year_graduated'] ?? $student->senior_high_year_graduated,
            'senior_high_awards' => $validated['senior_high_awards'] ?? $student->senior_high_awards,
            'profile_submitted' => true,
            'profile_submitted_at' => now(),
        ]);

        // Update or create guardian
        Guardian::updateOrCreate(
            ['student_id' => $student->student_id],
            [
                'father_name' => $validated['father_name'] ?? null,
                'father_occupation' => $validated['father_occupation'] ?? null,
                'father_contact' => $validated['father_contact'] ?? null,
                'mother_name' => $validated['mother_name'] ?? null,
                'mother_occupation' => $validated['mother_occupation'] ?? null,
                'mother_contact' => $validated['mother_contact'] ?? null,
                'guardian_name' => $validated['guardian_name'] ?? null,
                'guardian_contact' => $validated['guardian_contact'] ?? null,
                'emergency_contact' => $validated['emergency_contact'] ?? null,
                'family_income_bracket' => $validated['family_income_bracket'] ?? null,
                'living_status' => $validated['living_status'] ?? null,
            ]
        );

        // Update or create physical profile (height & weight)
        PhysicalProfile::updateOrCreate(
            ['student_id' => $student->student_id],
            [
                'height' => $validated['height'] ?? null,
                'weight' => $validated['weight'] ?? null,
            ]
        );

        // Sync skills
        if (isset($validated['skill_ids'])) {
            $student->skills()->sync($validated['skill_ids']);
        }

        // Sync talents
        if (isset($validated['talent_ids'])) {
            $student->talents()->sync($validated['talent_ids']);
        }

        return response()->json(['message' => 'Profile submitted successfully. Your profile is now locked.']);
    }

    /**
     * Save profile as draft without locking it.
     * Only allowed if profile has not been submitted yet.
     */
    public function saveDraft(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'Student record not found'], 404);
        }

        if ($student->profile_submitted) {
            return response()->json(['message' => 'Profile has already been submitted and cannot be edited.'], 403);
        }

        $validated = $request->validate([
            'nickname' => 'nullable|string|max:100',
            'gender' => 'nullable|string|max:10',
            'birthdate' => 'nullable|date',
            'civil_status' => 'nullable|string|max:20',
            'nationality' => 'nullable|string|max:100',
            'religion' => 'nullable|string|max:100',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|string|email|max:100',
            'present_address' => 'nullable|string',
            'permanent_address' => 'nullable|string',
            'father_name' => 'nullable|string|max:100',
            'father_occupation' => 'nullable|string|max:100',
            'father_contact' => 'nullable|string|max:20',
            'mother_name' => 'nullable|string|max:100',
            'mother_occupation' => 'nullable|string|max:100',
            'mother_contact' => 'nullable|string|max:20',
            'guardian_name' => 'nullable|string|max:100',
            'guardian_contact' => 'nullable|string|max:20',
            'emergency_contact' => 'nullable|string|max:20',
            'family_income_bracket' => 'nullable|string|max:50',
            'living_status' => 'nullable|string|max:50',
            'elementary_school' => 'nullable|string|max:255',
            'elementary_year_graduated' => 'nullable|string|max:10',
            'elementary_awards' => 'nullable|string',
            'junior_high_school' => 'nullable|string|max:255',
            'junior_high_year_graduated' => 'nullable|string|max:10',
            'junior_high_awards' => 'nullable|string',
            'senior_high_school' => 'nullable|string|max:255',
            'senior_high_year_graduated' => 'nullable|string|max:10',
            'senior_high_awards' => 'nullable|string',
            'height' => 'nullable|numeric|min:0|max:300',
            'weight' => 'nullable|numeric|min:0|max:500',
            'skill_ids' => 'nullable|array',
            'skill_ids.*' => 'integer|exists:skills,skill_id',
            'talent_ids' => 'nullable|array',
            'talent_ids.*' => 'integer|exists:talents,talent_id',
        ]);

        $student->update([
            'nickname' => $validated['nickname'] ?? $student->nickname,
            'gender' => $validated['gender'] ?? $student->gender,
            'birthdate' => $validated['birthdate'] ?? $student->birthdate,
            'civil_status' => $validated['civil_status'] ?? $student->civil_status,
            'nationality' => $validated['nationality'] ?? $student->nationality,
            'religion' => $validated['religion'] ?? $student->religion,
            'contact_number' => $validated['contact_number'] ?? $student->contact_number,
            'email' => $validated['email'] ?? $student->email,
            'present_address' => $validated['present_address'] ?? $student->present_address,
            'permanent_address' => $validated['permanent_address'] ?? $student->permanent_address,
            'elementary_school' => $validated['elementary_school'] ?? $student->elementary_school,
            'elementary_year_graduated' => $validated['elementary_year_graduated'] ?? $student->elementary_year_graduated,
            'elementary_awards' => $validated['elementary_awards'] ?? $student->elementary_awards,
            'junior_high_school' => $validated['junior_high_school'] ?? $student->junior_high_school,
            'junior_high_year_graduated' => $validated['junior_high_year_graduated'] ?? $student->junior_high_year_graduated,
            'junior_high_awards' => $validated['junior_high_awards'] ?? $student->junior_high_awards,
            'senior_high_school' => $validated['senior_high_school'] ?? $student->senior_high_school,
            'senior_high_year_graduated' => $validated['senior_high_year_graduated'] ?? $student->senior_high_year_graduated,
            'senior_high_awards' => $validated['senior_high_awards'] ?? $student->senior_high_awards,
        ]);

        Guardian::updateOrCreate(
            ['student_id' => $student->student_id],
            [
                'father_name' => $validated['father_name'] ?? null,
                'father_occupation' => $validated['father_occupation'] ?? null,
                'father_contact' => $validated['father_contact'] ?? null,
                'mother_name' => $validated['mother_name'] ?? null,
                'mother_occupation' => $validated['mother_occupation'] ?? null,
                'mother_contact' => $validated['mother_contact'] ?? null,
                'guardian_name' => $validated['guardian_name'] ?? null,
                'guardian_contact' => $validated['guardian_contact'] ?? null,
                'emergency_contact' => $validated['emergency_contact'] ?? null,
                'family_income_bracket' => $validated['family_income_bracket'] ?? null,
                'living_status' => $validated['living_status'] ?? null,
            ]
        );

        PhysicalProfile::updateOrCreate(
            ['student_id' => $student->student_id],
            [
                'height' => $validated['height'] ?? null,
                'weight' => $validated['weight'] ?? null,
            ]
        );

        if (isset($validated['skill_ids'])) {
            $student->skills()->sync($validated['skill_ids']);
        }

        if (isset($validated['talent_ids'])) {
            $student->talents()->sync($validated['talent_ids']);
        }

        return response()->json(['message' => 'Draft saved successfully.']);
    }

    /**
     * Upload a document (always allowed, even after profile submission).
     */
    public function uploadDocument(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB
            'document_label' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $path = $file->store('student_documents', 'public');

        // Find or create a generic document type for student profile uploads
        $docType = \App\Models\DocumentType::firstOrCreate(
            ['name' => $request->document_label ?? 'Student Profile Document'],
            [
                'description' => 'Document uploaded via student profile',
                'required_for_role' => 'student',
                'is_mandatory' => false,
            ]
        );

        $submission = DocumentSubmission::create([
            'user_id' => $user->id,
            'document_type_id' => $docType->id,
            'file_path' => $path,
            'original_filename' => $originalName,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => [
                'id' => $submission->id,
                'original_filename' => $originalName,
                'file_path' => url('storage/' . $path),
                'status' => 'pending',
                'type_name' => $docType->name,
                'created_at' => $submission->created_at,
            ]
        ]);
    }
}

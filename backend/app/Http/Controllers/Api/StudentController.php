<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['user', 'academicRecords', 'skills', 'organizations'])
            ->whereHas('user');

        // Advanced Search & Filtering
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('id_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('course')) {
            $query->whereHas('academicRecords', function($q) use ($request) {
                $q->where('course', $request->input('course'));
            });
        }
        
        if ($request->filled('year_level')) {
            $query->whereHas('academicRecords', function($q) use ($request) {
                $q->where('year_level', $request->input('year_level'));
            });
        }

        // Filtering by Skill (Relationship)
        if ($request->filled('skill')) {
            $skillName = $request->input('skill');
            $query->whereHas('skills', function($q) use ($skillName) {
                $q->where('skill_name', 'like', "%{$skillName}%");
            });
        }

        // Filtering by Affiliation (Organization)
        if ($request->filled('affiliation')) {
            $orgName = $request->input('affiliation');
            $query->whereHas('organizations', function($q) use ($orgName) {
                $q->where('org_name', 'like', "%{$orgName}%");
            });
        }

        // Filtering by Classification (if we use behavioral/physical profile)
        if ($request->has('classification')) {
            $classification = $request->input('classification');
            // Assuming this is a generic search for now or matches a specific field
        }

        return response()->json($query->paginate(24)); // Larger page size for card view
    }

    public function store(Request $request)
    {
        // 0. Validate Request Data
        $request->validate([
            'email' => 'required|email|unique:users,email',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'student_id' => 'required|string|unique:students,id_number'
        ]);

        return \DB::transaction(function() use ($request) {
            // 1. Manually Create User Account
            $user = \App\Models\User::create([
                'name' => $request->first_name . ' ' . $request->last_name,
                'email' => $request->email,
                'password' => \Hash::make($request->student_id), // Default password is ID
                'role' => 'student',
                'must_change_password' => true
            ]);

            // 2. Create Student Record using the user_id
            $studentData = $request->except(['skills_json', 'affiliations', 'course', 'year_level', 'overall_gwa', 'academic_standing']);
            $studentData['user_id'] = $user->id;
            $studentData['id_number'] = $request->student_id; // Map alphanumeric ID to new string column
            
            $student = Student::create($studentData);

            // 3. Sync Academic Records
            $student->academicRecords()->create([
                'course' => $request->input('course', 'BSIT'),
                'year_level' => $request->input('year_level', '1'),
                'gwa' => $request->input('overall_gwa'),
                'academic_standing' => $request->input('academic_standing', 'Regular')
            ]);

            // 4. Sync Skills
            if ($request->has('skills_json')) {
                $skillIds = [];
                foreach ($request->input('skills_json') as $skillName) {
                    $skill = \App\Models\Skill::firstOrCreate(['skill_name' => $skillName]);
                    $skillIds[$skill->skill_id] = ['proficiency_level' => 'Intermediate'];
                }
                $student->skills()->sync($skillIds);
            }

            // 5. Sync Affiliations
            if ($request->has('affiliations')) {
                $orgData = [];
                foreach ($request->input('affiliations') as $aff) {
                    $org = \App\Models\Organization::firstOrCreate(['org_name' => $aff['org_name']]);
                    $orgData[$org->org_id] = ['position' => $aff['position']];
                }
                $student->organizations()->sync($orgData);
            }

            return response()->json($student->load(['user', 'academicRecords', 'skills', 'organizations']), 201);
        });
    }

    public function show(Student $student)
    {
        return response()->json($student->load([
            'user', 
            'guardians', 
            'academicRecords', 
            'violations', 
            'achievements', 
            'skills', 
            'talents',
            'organizations', 
            'participatingEvents',
            'physicalProfile',
            'medicalRecords',
            'behavioralProfile',
            'user.documentSubmissions.type'
        ]));
    }

    public function addViolation(Request $request, Student $student)
    {
        $validated = $request->validate([
            'violation_type' => 'required|string',
            'severity_level' => 'required|string',
            'sanction_given' => 'nullable|string',
            'date_of_violation' => 'required|date',
            'case_status' => 'required|string'
        ]);

        $violation = $student->violations()->create($validated);
        return response()->json($violation, 201);
    }

    public function update(Request $request, Student $student)
    {
        return \DB::transaction(function() use ($request, $student) {
            // Update associated User record if exists
            if ($student->user) {
                $student->user->update([
                    'name' => ($request->first_name ?? $student->first_name) . ' ' . ($request->last_name ?? $student->last_name),
                    'email' => $request->email ?? $student->email
                ]);
            }

            $studentData = $request->except(['skills_json', 'affiliations', 'course', 'year_level', 'overall_gwa', 'academic_standing', 'father_name', 'mother_name', 'guardian_contact']);
            if ($request->has('student_id')) {
                $studentData['id_number'] = $request->student_id;
            }
            $student->update($studentData);

            // Update associated guardian info if provided
            if ($request->hasAny(['father_name', 'mother_name', 'guardian_contact'])) {
                $student->guardians()->updateOrCreate(
                    ['student_id' => $student->student_id],
                    $request->only(['father_name', 'mother_name', 'guardian_contact'])
                );
            }

            // Update Academic Record (usually we just update the first one or create new per semester)
            if ($request->hasAny(['course', 'year_level', 'overall_gwa', 'academic_standing'])) {
                $academicData = [];
                if ($request->has('course')) $academicData['course'] = $request->input('course');
                if ($request->has('year_level')) $academicData['year_level'] = $request->input('year_level');
                if ($request->has('overall_gwa')) $academicData['gwa'] = $request->input('overall_gwa');
                if ($request->has('academic_standing')) $academicData['academic_standing'] = $request->input('academic_standing');
                
                if (!empty($academicData)) {
                    $student->academicRecords()->updateOrCreate(
                        ['student_id' => $student->student_id],
                        $academicData
                    );
                }
            }

            // Sync Skills
            if ($request->has('skills_json')) {
                $skillIds = [];
                foreach ($request->input('skills_json') as $skillName) {
                    $skill = \App\Models\Skill::firstOrCreate(['skill_name' => $skillName]);
                    $skillIds[$skill->id] = ['proficiency_level' => 'Intermediate'];
                }
                $student->skills()->sync($skillIds);
            }

            // Sync Affiliations
            if ($request->has('affiliations')) {
                $orgData = [];
                foreach ($request->input('affiliations') as $aff) {
                    $org = \App\Models\Organization::firstOrCreate(['org_name' => $aff['org_name']]);
                    $orgData[$org->id] = ['position' => $aff['position']];
                }
                $student->organizations()->sync($orgData);
            }

            return response()->json($student->load(['user', 'academicRecords', 'skills', 'organizations']));
        });
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(['message' => 'Deleted']);
    }
}

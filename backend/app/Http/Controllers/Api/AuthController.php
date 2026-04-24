<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'birthdate' => 'required|date',
            'gender' => 'required|in:Male,Female,Other',
            'address' => 'required|string',
            'contact_number' => 'required|string|max:20',
            'email' => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,faculty,student,staff,dean'
        ]);

        $user = User::create([
            'name' => $validated['first_name'] . ' ' . $validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        if ($validated['role'] === 'student') {
            \App\Models\Student::create([
                'user_id' => $user->id,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'birthdate' => $validated['birthdate'],
                'gender' => $validated['gender'],
                'present_address' => $validated['address'],
                'contact_number' => $validated['contact_number'],
                'email' => $validated['email'],
            ]);
        } elseif ($validated['role'] === 'faculty') {
            \App\Models\Faculty::create([
                'user_id' => $user->id,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'birthdate' => $validated['birthdate'],
                'gender' => $validated['gender'],
                'address' => $validated['address'],
                'contact_number' => $validated['contact_number'],
                'email' => $validated['email'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'access_token' => $token,
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid login details'], 401);
        }

        // Check if user is approved
        if ($user->status === 'pending') {
            return response()->json([
                'message' => 'Your account is pending verification. Please wait for an administrator to approve your registration.'
            ], 403);
        }

        if ($user->status === 'rejected') {
            return response()->json([
                'message' => 'Your account registration has been rejected. Please contact support for more information.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully',
            'access_token' => $token,
            'user' => $user
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'student') {
            $user->load(['student.academicRecords', 'student.guardians']);
        } elseif ($user->role === 'faculty') {
            $user->load('faculty');
        }
        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'contact_number' => 'nullable|string',
            'address' => 'nullable|string',
            'nickname' => 'nullable|string',
            'gender' => 'nullable|string',
            'nationality' => 'nullable|string',
            'civil_status' => 'nullable|string',
            'religion' => 'nullable|string',
            'father_name' => 'nullable|string',
            'mother_name' => 'nullable|string',
            'guardian_contact' => 'nullable|string',
            'birthdate' => 'nullable|date',
        ]);

        if ($user->role === 'student' && $user->student) {
            $user->student->update([
                'contact_number' => $validated['contact_number'] ?? $user->student->contact_number,
                'present_address' => $validated['address'] ?? $user->student->present_address,
                'nickname' => $validated['nickname'] ?? $user->student->nickname,
                'gender' => $validated['gender'] ?? $user->student->gender,
                'nationality' => $validated['nationality'] ?? $user->student->nationality,
                'civil_status' => $validated['civil_status'] ?? $user->student->civil_status,
                'religion' => $validated['religion'] ?? $user->student->religion,
            ]);

            // Auto-create or update guardian info
            $user->student->guardians()->updateOrCreate(
                ['student_id' => $user->student->student_id],
                [
                    'father_name' => $validated['father_name'] ?? null,
                    'mother_name' => $validated['mother_name'] ?? null,
                    'guardian_contact' => $validated['guardian_contact'] ?? null,
                ]
            );
        } elseif ($user->role === 'faculty' && $user->faculty) {
            $user->faculty->update([
                'contact_number' => $validated['contact_number'] ?? $user->faculty->contact_number,
                'address' => $validated['address'] ?? $user->faculty->address,
                'nickname' => $validated['nickname'] ?? $user->faculty->nickname,
                'gender' => $validated['gender'] ?? $user->faculty->gender,
                'birthdate' => $validated['birthdate'] ?? $user->faculty->birthdate,
                'nationality' => $validated['nationality'] ?? $user->faculty->nationality,
                'civil_status' => $validated['civil_status'] ?? $user->faculty->civil_status,
                'religion' => $validated['religion'] ?? $user->faculty->religion,
            ]);
        }

        return response()->json(['message' => 'Profile updated successfully']);
    }

    public function uploadProfilePicture(Request $request)
    {
        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        $user = $request->user();

        if ($request->hasFile('profile_picture')) {
            // Delete old picture if exists
            if ($user->profile_picture && \Illuminate\Support\Facades\Storage::disk('public')->exists($user->profile_picture)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->profile_picture);
            }

            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->update(['profile_picture' => $path]);

            return response()->json([
                'message' => 'Profile picture uploaded successfully',
                'profile_picture' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password incorrect'], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
            'must_change_password' => false
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}

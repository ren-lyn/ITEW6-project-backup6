<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudentController;
use App\Http\Controllers\Api\FacultyController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ResearchController;
use App\Http\Controllers\Api\MaterialController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\AdminVerificationController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/picture', [AuthController::class, 'uploadProfilePicture']);
    Route::get('/profile/completion', [\App\Http\Controllers\Api\ProfileCompletionController::class, 'getScore']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Student Portal Features
    Route::get('/student/schedule', [\App\Http\Controllers\Api\StudentPortalController::class, 'getSchedule']);
    Route::get('/student/courses', [\App\Http\Controllers\Api\StudentPortalController::class, 'getEnrolledCourses']);
    Route::get('/student/registration-form', [\App\Http\Controllers\Api\StudentPortalController::class, 'getRegistrationData']);

    // Student Comprehensive Profile (My Profile)
    Route::get('/student/my-profile', [\App\Http\Controllers\Api\StudentProfileController::class, 'getProfile']);
    Route::post('/student/my-profile/submit', [\App\Http\Controllers\Api\StudentProfileController::class, 'submitProfile']);
    Route::post('/student/my-profile/draft', [\App\Http\Controllers\Api\StudentProfileController::class, 'saveDraft']);
    Route::post('/student/my-profile/upload-document', [\App\Http\Controllers\Api\StudentProfileController::class, 'uploadDocument']);

    // Document Upload Phase (Students/Faculty)
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'upload']);

    // Admin Verification Phase
    // Only allow admins to use these routes
    Route::middleware(\App\Http\Middleware\AdminMiddleware::class)->group(function () {
        Route::get('/admin/verifications', [AdminVerificationController::class, 'index']);
        Route::post('/admin/verifications/{id}/approve', [AdminVerificationController::class, 'approve']);
        Route::post('/admin/verifications/{id}/reject', [AdminVerificationController::class, 'reject']);

        // Phase 7: Reporting
        Route::get('/admin/reports/students', [\App\Http\Controllers\Api\ReportController::class, 'getStudentsReport']);
        Route::get('/admin/reports/faculty', [\App\Http\Controllers\Api\ReportController::class, 'getFacultyReport']);

        // Phase 8: Archiving
        Route::get('/admin/archives', [\App\Http\Controllers\Api\ArchivingController::class, 'index']);
        Route::post('/admin/users/{id}/archive', [\App\Http\Controllers\Api\ArchivingController::class, 'archive']);
        Route::post('/admin/users/{id}/restore', [\App\Http\Controllers\Api\ArchivingController::class, 'restore']);
    });

    // Modules
    Route::apiResource('students', StudentController::class);
    Route::post('students/{student}/violations', [StudentController::class, 'addViolation']);

    Route::apiResource('faculties', FacultyController::class);
    Route::apiResource('events', EventController::class);
    Route::get('/faculty/schedules', [ScheduleController::class, 'getFacultySchedules']);
    Route::apiResource('schedules', ScheduleController::class);
    Route::apiResource('research', ResearchController::class);
    Route::apiResource('materials', MaterialController::class);

    // Attendance
    Route::get('/attendance', [\App\Http\Controllers\Api\AttendanceController::class, 'index']);
    Route::post('/attendance/import', [\App\Http\Controllers\Api\AttendanceController::class, 'import']);
    Route::get('/attendance/analytics', [\App\Http\Controllers\Api\AttendanceController::class, 'getRiskAnalytics']);
    Route::get('/student/attendance', [\App\Http\Controllers\Api\AttendanceController::class, 'getStudentAttendance']);
});

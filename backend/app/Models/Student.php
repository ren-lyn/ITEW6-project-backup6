<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $primaryKey = 'student_id';
    protected $guarded = ['student_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guardians()
    {
        return $this->hasOne(Guardian::class, 'student_id');
    }

    public function academicRecords()
    {
        return $this->hasMany(AcademicRecord::class, 'student_id');
    }

    public function latestAcademicRecord()
    {
        return $this->hasOne(AcademicRecord::class, 'student_id')->latestOfMany('record_id');
    }

    public function medicalRecords()
    {
        return $this->hasMany(MedicalRecord::class, 'student_id');
    }

    public function violations()
    {
        return $this->hasMany(Violation::class, 'student_id');
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class, 'student_id');
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'student_skills', 'student_id', 'skill_id')->withPivot('proficiency_level');
    }

    public function talents()
    {
        return $this->belongsToMany(Talent::class, 'student_talents', 'student_id', 'talent_id');
    }

    public function organizations()
    {
        return $this->belongsToMany(Organization::class, 'student_organizations', 'student_id', 'org_id')->withPivot('position', 'years_active');
    }

    public function behavioralProfile()
    {
        return $this->hasOne(BehavioralProfile::class, 'student_id');
    }

    public function physicalProfile()
    {
        return $this->hasOne(PhysicalProfile::class, 'student_id');
    }

    public function participatingEvents()
    {
        return $this->belongsToMany(Event::class, 'event_participants', 'student_id', 'event_id')->withPivot('role');
    }

    public function authoredResearch()
    {
        return $this->belongsToMany(Research::class, 'research_authors', 'student_id', 'research_id');
    }
}

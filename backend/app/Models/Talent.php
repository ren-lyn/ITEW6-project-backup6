<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Talent extends Model
{
    use HasFactory;
    protected $table = 'talents';
    protected $primaryKey = 'talent_id';
    protected $guarded = ['talent_id'];

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_talents', 'talent_id', 'student_id')
            ->withPivot('student_talent_id')
            ->withTimestamps();
    }
}

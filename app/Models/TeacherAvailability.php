<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'teacher_profile_id',
    'day_of_week',
    'starts_at',
    'ends_at',
    'timezone',
    'default_duration_minutes',
    'default_capacity',
    'is_active',
    'notes',
])]
class TeacherAvailability extends Model
{
    public const DAYS = [1, 2, 3, 4, 5, 6, 7];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<TeacherProfile, $this>
     */
    public function teacherProfile(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'default_duration_minutes' => 'integer',
            'default_capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'teacher_profile_id',
    'date',
    'starts_at',
    'ends_at',
    'type',
    'reason',
    'is_full_day',
])]
class TeacherAvailabilityException extends Model
{
    public const TYPE_UNAVAILABLE = 'unavailable';

    public const TYPE_EXTRA_AVAILABLE = 'extra_available';

    public const TYPES = [
        self::TYPE_UNAVAILABLE,
        self::TYPE_EXTRA_AVAILABLE,
    ];

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
            'date' => 'date',
            'is_full_day' => 'boolean',
        ];
    }
}

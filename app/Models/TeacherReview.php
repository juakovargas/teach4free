<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'teacher_user_id',
    'student_user_id',
    'class_session_id',
    'teaching_offer_id',
    'rating',
    'title',
    'comment',
    'teacher_response',
    'teacher_responded_at',
    'status',
    'hidden_at',
    'hidden_by',
    'hidden_reason',
    'reported_count',
    'admin_notes',
])]
class TeacherReview extends Model
{
    public const STATUS_PUBLISHED = 'published';

    public const STATUS_HIDDEN = 'hidden';

    public const STATUS_FLAGGED = 'flagged';

    public const STATUS_REMOVED = 'removed';

    public const STATUSES = [
        self::STATUS_PUBLISHED,
        self::STATUS_HIDDEN,
        self::STATUS_FLAGGED,
        self::STATUS_REMOVED,
    ];

    public const PUBLIC_STATUSES = [
        self::STATUS_PUBLISHED,
        self::STATUS_FLAGGED,
    ];

    /**
     * @param  Builder<TeacherReview>  $query
     * @return Builder<TeacherReview>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->whereIn('status', self::PUBLIC_STATUSES);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_user_id');
    }

    /**
     * @return BelongsTo<ClassSession, $this>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class, 'class_session_id');
    }

    /**
     * @return BelongsTo<TeachingOffer, $this>
     */
    public function offer(): BelongsTo
    {
        return $this->belongsTo(TeachingOffer::class, 'teaching_offer_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function hiddenBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'hidden_by');
    }

    /**
     * @return HasMany<ReviewReport, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(ReviewReport::class);
    }

    public function isPubliclyVisible(): bool
    {
        return in_array($this->status, self::PUBLIC_STATUSES, true);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'teacher_responded_at' => 'datetime',
            'hidden_at' => 'datetime',
            'reported_count' => 'integer',
        ];
    }
}

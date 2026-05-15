<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'teacher_review_id',
    'reporter_user_id',
    'type',
    'description',
    'status',
    'priority',
    'admin_notes',
    'resolved_by',
    'resolved_at',
])]
class ReviewReport extends Model
{
    public const TYPE_ABUSIVE_LANGUAGE = 'abusive_language';

    public const TYPE_FALSE_INFORMATION = 'false_information';

    public const TYPE_HARASSMENT = 'harassment';

    public const TYPE_SPAM = 'spam';

    public const TYPE_MALICIOUS_REVIEW = 'malicious_review';

    public const TYPE_PRIVACY_ISSUE = 'privacy_issue';

    public const TYPE_OTHER = 'other';

    public const TYPES = [
        self::TYPE_ABUSIVE_LANGUAGE,
        self::TYPE_FALSE_INFORMATION,
        self::TYPE_HARASSMENT,
        self::TYPE_SPAM,
        self::TYPE_MALICIOUS_REVIEW,
        self::TYPE_PRIVACY_ISSUE,
        self::TYPE_OTHER,
    ];

    public const STATUS_OPEN = 'open';

    public const STATUS_IN_REVIEW = 'in_review';

    public const STATUS_RESOLVED = 'resolved';

    public const STATUS_DISMISSED = 'dismissed';

    public const STATUSES = [
        self::STATUS_OPEN,
        self::STATUS_IN_REVIEW,
        self::STATUS_RESOLVED,
        self::STATUS_DISMISSED,
    ];

    public const PRIORITY_LOW = 'low';

    public const PRIORITY_NORMAL = 'normal';

    public const PRIORITY_HIGH = 'high';

    public const PRIORITY_URGENT = 'urgent';

    public const PRIORITIES = [
        self::PRIORITY_LOW,
        self::PRIORITY_NORMAL,
        self::PRIORITY_HIGH,
        self::PRIORITY_URGENT,
    ];

    public static function defaultPriorityFor(string $type): string
    {
        return match ($type) {
            self::TYPE_ABUSIVE_LANGUAGE,
            self::TYPE_HARASSMENT,
            self::TYPE_PRIVACY_ISSUE => self::PRIORITY_HIGH,
            self::TYPE_FALSE_INFORMATION,
            self::TYPE_MALICIOUS_REVIEW => self::PRIORITY_NORMAL,
            self::TYPE_SPAM => self::PRIORITY_LOW,
            default => self::PRIORITY_NORMAL,
        };
    }

    /**
     * @return BelongsTo<TeacherReview, $this>
     */
    public function review(): BelongsTo
    {
        return $this->belongsTo(TeacherReview::class, 'teacher_review_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }
}

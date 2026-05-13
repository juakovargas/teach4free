<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'reporter_user_id',
    'reported_user_id',
    'teaching_offer_id',
    'application_id',
    'class_session_id',
    'type',
    'status',
    'priority',
    'subject',
    'description',
    'admin_notes',
    'resolved_by',
    'resolved_at',
])]
class Incident extends Model
{
    public const TYPE_USER = 'user';

    public const TYPE_TEACHING_OFFER = 'teaching_offer';

    public const TYPE_APPLICATION = 'application';

    public const TYPE_SESSION = 'session';

    public const TYPE_TECHNICAL = 'technical';

    public const TYPE_ABUSE = 'abuse';

    public const TYPE_SPAM = 'spam';

    public const TYPE_PAYMENT_REQUEST = 'payment_request';

    public const TYPE_COMMERCIAL_PRESSURE = 'commercial_pressure';

    public const TYPE_OTHER = 'other';

    public const TYPES = [
        self::TYPE_USER,
        self::TYPE_TEACHING_OFFER,
        self::TYPE_APPLICATION,
        self::TYPE_SESSION,
        self::TYPE_TECHNICAL,
        self::TYPE_ABUSE,
        self::TYPE_SPAM,
        self::TYPE_PAYMENT_REQUEST,
        self::TYPE_COMMERCIAL_PRESSURE,
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
    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    /**
     * @return BelongsTo<TeachingOffer, $this>
     */
    public function teachingOffer(): BelongsTo
    {
        return $this->belongsTo(TeachingOffer::class);
    }

    /**
     * @return BelongsTo<TeachingOfferApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(TeachingOfferApplication::class, 'application_id');
    }

    /**
     * @return BelongsTo<ClassSession, $this>
     */
    public function classSession(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class);
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

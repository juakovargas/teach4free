<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'conversation_id',
    'message_id',
    'reporter_user_id',
    'reported_user_id',
    'type',
    'status',
    'priority',
    'description',
    'admin_notes',
    'public_response',
    'public_response_sent_at',
    'public_response_by',
    'resolved_by',
    'resolved_at',
])]
class ConversationReport extends Model
{
    public const TYPE_PAYMENT_REQUEST = 'payment_request';

    public const TYPE_COMMERCIAL_PRESSURE = 'commercial_pressure';

    public const TYPE_SPAM = 'spam';

    public const TYPE_ABUSE = 'abuse';

    public const TYPE_HARASSMENT = 'harassment';

    public const TYPE_UNSAFE_LINK = 'unsafe_link';

    public const TYPE_PRIVACY_ISSUE = 'privacy_issue';

    public const TYPE_OTHER = 'other';

    public const TYPES = [
        self::TYPE_PAYMENT_REQUEST,
        self::TYPE_COMMERCIAL_PRESSURE,
        self::TYPE_SPAM,
        self::TYPE_ABUSE,
        self::TYPE_HARASSMENT,
        self::TYPE_UNSAFE_LINK,
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
            self::TYPE_PAYMENT_REQUEST => self::PRIORITY_URGENT,
            self::TYPE_COMMERCIAL_PRESSURE,
            self::TYPE_ABUSE,
            self::TYPE_HARASSMENT,
            self::TYPE_UNSAFE_LINK,
            self::TYPE_PRIVACY_ISSUE => self::PRIORITY_HIGH,
            self::TYPE_SPAM => self::PRIORITY_NORMAL,
            default => self::PRIORITY_NORMAL,
        };
    }

    /**
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * @return BelongsTo<ConversationMessage, $this>
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(ConversationMessage::class, 'message_id');
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
    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function publicResponder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'public_response_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'public_response_sent_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }
}

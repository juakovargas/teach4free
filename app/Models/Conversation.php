<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'type',
    'teaching_offer_id',
    'teaching_offer_application_id',
    'class_session_id',
    'subject',
    'status',
    'last_message_at',
    'created_by_user_id',
    'closed_at',
    'closed_by_user_id',
    'close_reason',
])]
class Conversation extends Model
{
    public const TYPE_DIRECT = 'direct';

    public const TYPE_APPLICATION = 'application';

    public const TYPE_OFFER = 'offer';

    public const TYPE_SESSION = 'session';

    public const TYPE_SUPPORT = 'support';

    public const TYPES = [
        self::TYPE_DIRECT,
        self::TYPE_APPLICATION,
        self::TYPE_OFFER,
        self::TYPE_SESSION,
        self::TYPE_SUPPORT,
    ];

    public const STATUS_OPEN = 'open';

    public const STATUS_CLOSED = 'closed';

    public const STATUS_REPORTED = 'reported';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [
        self::STATUS_OPEN,
        self::STATUS_CLOSED,
        self::STATUS_REPORTED,
        self::STATUS_ARCHIVED,
    ];

    public function isOpen(): bool
    {
        return $this->status === self::STATUS_OPEN || $this->status === self::STATUS_REPORTED;
    }

    /**
     * @return HasMany<ConversationParticipant, $this>
     */
    public function participants(): HasMany
    {
        return $this->hasMany(ConversationParticipant::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot(['role', 'last_read_at', 'archived_at', 'muted_at'])
            ->withTimestamps();
    }

    /**
     * @return HasMany<ConversationMessage, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(ConversationMessage::class);
    }

    /**
     * @return HasOne<ConversationMessage, $this>
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(ConversationMessage::class)->latestOfMany();
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
        return $this->belongsTo(TeachingOfferApplication::class, 'teaching_offer_application_id');
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
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function closer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by_user_id');
    }

    /**
     * @return HasMany<ConversationReport, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(ConversationReport::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}

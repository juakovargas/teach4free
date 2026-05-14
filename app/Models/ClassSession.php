<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'teaching_offer_id',
    'teacher_user_id',
    'application_id',
    'title',
    'description',
    'starts_at',
    'ends_at',
    'timezone',
    'capacity',
    'meeting_tool',
    'meeting_url',
    'status',
    'cancellation_reason',
    'completed_at',
    'cancelled_at',
    'no_show_marked_at',
])]
class ClassSession extends Model
{
    public const STATUS_SCHEDULED = 'scheduled';

    public const STATUS_COMPLETED = 'completed';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_NO_SHOW = 'no_show';

    public const STATUSES = [
        self::STATUS_SCHEDULED,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELLED,
        self::STATUS_NO_SHOW,
    ];

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
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_user_id');
    }

    /**
     * @return BelongsTo<TeachingOfferApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(TeachingOfferApplication::class, 'application_id');
    }

    /**
     * @return HasMany<ClassSessionAttendee, $this>
     */
    public function attendees(): HasMany
    {
        return $this->hasMany(ClassSessionAttendee::class);
    }

    /**
     * @return HasOne<Conversation, $this>
     */
    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'capacity' => 'integer',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'no_show_marked_at' => 'datetime',
        ];
    }
}

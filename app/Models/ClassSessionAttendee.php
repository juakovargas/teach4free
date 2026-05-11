<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'class_session_id',
    'user_id',
    'application_id',
    'status',
    'joined_at',
    'cancelled_at',
    'no_show_at',
])]
class ClassSessionAttendee extends Model
{
    public const STATUS_ENROLLED = 'enrolled';

    public const STATUS_CANCELLED = 'cancelled';

    public const STATUS_ATTENDED = 'attended';

    public const STATUS_NO_SHOW = 'no_show';

    public const STATUSES = [
        self::STATUS_ENROLLED,
        self::STATUS_CANCELLED,
        self::STATUS_ATTENDED,
        self::STATUS_NO_SHOW,
    ];

    /**
     * @return BelongsTo<ClassSession, $this>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ClassSession::class, 'class_session_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<TeachingOfferApplication, $this>
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(TeachingOfferApplication::class, 'application_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'no_show_at' => 'datetime',
        ];
    }
}

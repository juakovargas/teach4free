<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'conversation_id',
    'user_id',
    'role',
    'last_read_at',
    'archived_at',
    'muted_at',
])]
class ConversationParticipant extends Model
{
    public const ROLE_LEARNER = 'learner';

    public const ROLE_TEACHER = 'teacher';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_PARTICIPANT = 'participant';

    public const ROLES = [
        self::ROLE_LEARNER,
        self::ROLE_TEACHER,
        self::ROLE_ADMIN,
        self::ROLE_PARTICIPANT,
    ];

    /**
     * @return BelongsTo<Conversation, $this>
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_read_at' => 'datetime',
            'archived_at' => 'datetime',
            'muted_at' => 'datetime',
        ];
    }
}

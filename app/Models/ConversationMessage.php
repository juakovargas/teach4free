<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'conversation_id',
    'sender_user_id',
    'reply_to_message_id',
    'body',
    'system_message',
    'read_at',
    'edited_at',
    'deleted_at',
])]
class ConversationMessage extends Model
{
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
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_user_id');
    }

    /**
     * @return BelongsTo<ConversationMessage, $this>
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_message_id');
    }

    /**
     * @return HasMany<ConversationReport, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(ConversationReport::class, 'message_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'system_message' => 'boolean',
            'read_at' => 'datetime',
            'edited_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }
}

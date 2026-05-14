<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'email_session_scheduled_enabled',
    'email_session_cancelled_enabled',
    'email_session_completed_enabled',
    'email_session_reminder_24h_enabled',
    'email_session_reminder_1h_enabled',
    'email_application_received_enabled',
    'email_application_accepted_enabled',
    'email_application_rejected_enabled',
    'email_application_cancelled_enabled',
    'email_waiting_list_enabled',
    'email_new_message_enabled',
    'email_platform_updates_enabled',
])]
class UserNotificationPreference extends Model
{
    public const EMAIL_FIELDS = [
        'email_session_scheduled_enabled',
        'email_session_cancelled_enabled',
        'email_session_completed_enabled',
        'email_session_reminder_24h_enabled',
        'email_session_reminder_1h_enabled',
        'email_application_received_enabled',
        'email_application_accepted_enabled',
        'email_application_rejected_enabled',
        'email_application_cancelled_enabled',
        'email_waiting_list_enabled',
        'email_new_message_enabled',
        'email_platform_updates_enabled',
    ];

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
        return collect(self::EMAIL_FIELDS)
            ->mapWithKeys(fn (string $field): array => [$field => 'boolean'])
            ->all();
    }
}

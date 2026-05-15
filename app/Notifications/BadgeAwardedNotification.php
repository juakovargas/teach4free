<?php

namespace App\Notifications;

use App\Models\UserBadge;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BadgeAwardedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly UserBadge $userBadge)
    {
        $this->userBadge->loadMissing('badge');
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $locale = $notifiable->preferred_locale ?? config('app.locale');
        $badge = $this->userBadge->badge;
        $badgeName = $badge
            ? __('ui.badges.definitions.'.$badge->key.'.name', [], $locale)
            : __('ui.badges.unknown_badge', [], $locale);

        if ($badge && $badgeName === 'ui.badges.definitions.'.$badge->key.'.name') {
            $badgeName = $badge->name;
        }

        return [
            'event' => 'badge_awarded',
            'title' => __('ui.badges.notifications.awarded.title', ['badge' => $badgeName], $locale),
            'message' => __('ui.badges.notifications.awarded.message', ['badge' => $badgeName], $locale),
            'action_url' => route('profile.teacher.badges.edit'),
            'badge_id' => $badge?->id,
            'badge_key' => $badge?->key,
            'user_badge_id' => $this->userBadge->id,
        ];
    }
}

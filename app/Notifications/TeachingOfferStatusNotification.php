<?php

namespace App\Notifications;

use App\Models\TeachingOffer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TeachingOfferStatusNotification extends Notification
{
    use Queueable;

    public const EVENT_DEACTIVATED = 'offer_deactivated';

    public function __construct(
        private readonly TeachingOffer $offer,
        private readonly string $event,
    ) {}

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

        return [
            'event' => $this->event,
            'title' => __('ui.notifications.events.'.$this->event.'.title', [
                'offer' => $this->offer->title,
            ], $locale),
            'message' => __('ui.notifications.events.'.$this->event.'.message', [
                'offer' => $this->offer->title,
            ], $locale),
            'action_url' => route('teacher.offers.index'),
            'offer_id' => $this->offer->id,
        ];
    }
}

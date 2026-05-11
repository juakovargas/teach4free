<?php

namespace App\Notifications;

use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeachingOfferApplicationNotification extends Notification
{
    use Queueable;

    public const EVENT_STUDENT_APPLIED = 'student_applied';

    public const EVENT_APPLICATION_ACCEPTED = 'application_accepted';

    public const EVENT_APPLICATION_REJECTED = 'application_rejected';

    public const EVENT_APPLICATION_CANCELLED = 'application_cancelled';

    public const EVENT_JOINED_WAITING_LIST = 'joined_waiting_list';

    public const EVENT_WAITING_LIST_PROMOTED = 'waiting_list_promoted';

    public const EVENT_APPLICATION_CANCELLED_BY_TEACHER = 'application_cancelled_by_teacher';

    public const EVENT_OFFER_DEACTIVATED = 'offer_deactivated';

    private const MAIL_EVENTS = [
        self::EVENT_STUDENT_APPLIED,
        self::EVENT_APPLICATION_ACCEPTED,
        self::EVENT_APPLICATION_REJECTED,
        self::EVENT_APPLICATION_CANCELLED,
        self::EVENT_JOINED_WAITING_LIST,
        self::EVENT_WAITING_LIST_PROMOTED,
        self::EVENT_APPLICATION_CANCELLED_BY_TEACHER,
    ];

    public function __construct(
        private readonly TeachingOfferApplication $application,
        private readonly string $event,
    ) {
        $this->application->loadMissing(['offer', 'student', 'teacher']);
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return in_array($this->event, self::MAIL_EVENTS, true)
            ? ['database', 'mail']
            : ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->payload($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->preferred_locale ?? config('app.locale');
        $payload = $this->payload($notifiable, $locale);

        $mail = (new MailMessage)
            ->subject(__('ui.notifications.mail_subject', [
                'title' => $payload['title'],
            ], $locale))
            ->greeting(__('ui.notifications.mail_greeting', [], $locale))
            ->line($payload['message'])
            ->action(__('ui.notifications.open_action', [], $locale), $payload['action_url'])
            ->line(__('ui.notifications.mail_footer', [], $locale));

        $meetingUrl = $this->meetingUrlFor($this->application->offer);

        if ($meetingUrl && $this->event === self::EVENT_APPLICATION_ACCEPTED) {
            $mail->line(__('ui.notifications.meeting_url_line', [
                'url' => $meetingUrl,
            ], $locale));
        }

        return $mail;
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(object $notifiable, ?string $locale = null): array
    {
        $locale ??= $notifiable->preferred_locale ?? config('app.locale');
        $offer = $this->application->offer;
        $student = $this->application->student;

        return [
            'event' => $this->event,
            'title' => __('ui.notifications.events.'.$this->event.'.title', [
                'offer' => $offer->title,
            ], $locale),
            'message' => __('ui.notifications.events.'.$this->event.'.message', [
                'offer' => $offer->title,
                'student' => $student->name,
            ], $locale),
            'action_url' => $this->actionUrl($notifiable),
            'application_id' => $this->application->id,
            'offer_id' => $offer->id,
            'status' => $this->application->status,
        ];
    }

    private function actionUrl(object $notifiable): string
    {
        if ($this->application->teacher_user_id === $notifiable->id) {
            return route('teacher.applications.index');
        }

        return route('my-applications.index');
    }

    private function meetingUrlFor(TeachingOffer $offer): ?string
    {
        if (! $offer->meeting_url) {
            return null;
        }

        if ($offer->session_type === TeachingOffer::SESSION_OPEN_PUBLIC) {
            return $offer->meeting_url;
        }

        return $this->application->status === TeachingOfferApplication::STATUS_ACCEPTED
            ? $offer->meeting_url
            : null;
    }
}

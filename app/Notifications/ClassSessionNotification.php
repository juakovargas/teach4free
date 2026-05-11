<?php

namespace App\Notifications;

use App\Models\ClassSession;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ClassSessionNotification extends Notification
{
    use Queueable;

    public const EVENT_SESSION_SCHEDULED = 'session_scheduled';

    public const EVENT_STUDENT_ADDED = 'session_student_added';

    public const EVENT_SESSION_CANCELLED = 'session_cancelled';

    public const EVENT_SESSION_COMPLETED = 'session_completed';

    public const EVENT_SESSION_NO_SHOW = 'session_no_show';

    public const EVENT_STUDENT_CANCELLED = 'session_student_cancelled';

    public function __construct(
        private readonly ClassSession $session,
        private readonly string $event,
    ) {
        $this->session->loadMissing(['offer', 'teacher']);
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if ($notifiable instanceof User && $notifiable->wantsEmailNotification($this->preferenceField())) {
            $channels[] = 'mail';
        }

        return $channels;
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
            ->line(__('ui.sessions.email_time_line', [
                'start' => $this->session->starts_at?->format('Y-m-d H:i'),
                'end' => $this->session->ends_at?->format('Y-m-d H:i'),
                'timezone' => $this->session->timezone,
            ], $locale))
            ->action(__('ui.notifications.open_action', [], $locale), $payload['action_url'])
            ->line(__('ui.notifications.mail_footer', [], $locale));

        if ($this->canIncludeMeetingUrl($notifiable)) {
            $mail->line(__('ui.notifications.meeting_url_line', [
                'url' => $this->session->meeting_url,
            ], $locale));
        }

        return $mail;
    }

    private function preferenceField(): string
    {
        return match ($this->event) {
            self::EVENT_SESSION_CANCELLED,
            self::EVENT_STUDENT_CANCELLED => 'email_session_cancelled_enabled',
            self::EVENT_SESSION_COMPLETED,
            self::EVENT_SESSION_NO_SHOW => 'email_session_completed_enabled',
            default => 'email_session_scheduled_enabled',
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(object $notifiable, ?string $locale = null): array
    {
        $locale ??= $notifiable->preferred_locale ?? config('app.locale');

        return [
            'event' => $this->event,
            'title' => __('ui.notifications.events.'.$this->event.'.title', [
                'session' => $this->session->title,
                'offer' => $this->session->offer->title,
            ], $locale),
            'message' => __('ui.notifications.events.'.$this->event.'.message', [
                'session' => $this->session->title,
                'offer' => $this->session->offer->title,
            ], $locale),
            'action_url' => $this->actionUrl($notifiable),
            'session_id' => $this->session->id,
            'offer_id' => $this->session->teaching_offer_id,
            'status' => $this->session->status,
        ];
    }

    private function actionUrl(object $notifiable): string
    {
        if ($this->session->teacher_user_id === $notifiable->id) {
            return route('teacher.sessions.index');
        }

        return route('my-sessions.index');
    }

    private function canIncludeMeetingUrl(object $notifiable): bool
    {
        if (! $this->session->meeting_url) {
            return false;
        }

        if ($this->session->teacher_user_id === $notifiable->id) {
            return true;
        }

        return in_array($this->event, [
            self::EVENT_SESSION_SCHEDULED,
            self::EVENT_STUDENT_ADDED,
        ], true);
    }
}

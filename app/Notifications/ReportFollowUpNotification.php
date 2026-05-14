<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReportFollowUpNotification extends Notification
{
    use Queueable;

    public const KIND_INCIDENT = 'incident';

    public const KIND_CONVERSATION_REPORT = 'conversation_report';

    public const EVENT_RESPONSE_UPDATED = 'response_updated';

    public const EVENT_STATUS_UPDATED = 'status_updated';

    public function __construct(
        private readonly string $kind,
        private readonly int $reportId,
        private readonly string $subject,
        private readonly string $status,
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
        $statusKey = $this->kind === self::KIND_CONVERSATION_REPORT
            ? 'ui.conversation_report_statuses.'.$this->status
            : 'ui.incident_statuses.'.$this->status;

        return [
            'event' => 'report_follow_up_'.$this->event,
            'title' => __('ui.my_reports.notification_title', [], $locale),
            'message' => __('ui.my_reports.notification_message', [
                'subject' => $this->subject,
                'status' => __($statusKey, [], $locale),
            ], $locale),
            'action_url' => $this->actionUrl(),
            'report_kind' => $this->kind,
            'report_id' => $this->reportId,
            'status' => $this->status,
        ];
    }

    private function actionUrl(): string
    {
        return $this->kind === self::KIND_CONVERSATION_REPORT
            ? route('my-reports.conversation-reports.show', $this->reportId)
            : route('my-reports.incidents.show', $this->reportId);
    }
}

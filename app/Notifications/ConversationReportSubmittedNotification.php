<?php

namespace App\Notifications;

use App\Models\ConversationReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ConversationReportSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly ConversationReport $report)
    {
        $this->report->loadMissing(['conversation', 'reporter']);
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

        return [
            'event' => 'conversation_report_submitted',
            'title' => __('ui.admin_conversation_reports.notification_title', [], $locale),
            'message' => __('ui.admin_conversation_reports.notification_message', [
                'type' => __('ui.conversation_report_types.'.$this->report->type, [], $locale),
                'reporter' => $this->report->reporter?->name ?? __('ui.common.not_applicable', [], $locale),
            ], $locale),
            'action_url' => route('admin.conversation-reports.show', $this->report),
            'conversation_report_id' => $this->report->id,
            'conversation_id' => $this->report->conversation_id,
            'status' => $this->report->status,
            'priority' => $this->report->priority,
        ];
    }
}

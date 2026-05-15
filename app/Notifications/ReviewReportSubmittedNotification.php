<?php

namespace App\Notifications;

use App\Models\ReviewReport;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReviewReportSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly ReviewReport $report)
    {
        $this->report->loadMissing(['review.teacher', 'review.student', 'reporter']);
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
            'event' => 'review_report_submitted',
            'title' => __('ui.admin_review_reports.notification_title', [], $locale),
            'message' => __('ui.admin_review_reports.notification_message', [
                'type' => __('ui.review_report_types.'.$this->report->type, [], $locale),
                'reporter' => $this->report->reporter?->name ?? __('ui.common.not_applicable', [], $locale),
            ], $locale),
            'action_url' => route('admin.review-reports.show', $this->report),
            'review_report_id' => $this->report->id,
            'teacher_review_id' => $this->report->teacher_review_id,
            'status' => $this->report->status,
            'priority' => $this->report->priority,
        ];
    }
}

<?php

namespace App\Notifications;

use App\Models\TeacherReview;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class TeacherReviewNotification extends Notification
{
    use Queueable;

    public const EVENT_REVIEW_RECEIVED = 'review_received';

    public const EVENT_TEACHER_RESPONSE_ADDED = 'teacher_response_added';

    public const EVENT_REVIEW_HIDDEN = 'review_hidden';

    public function __construct(
        private readonly TeacherReview $review,
        private readonly string $event,
    ) {
        $this->review->loadMissing(['teacher', 'student', 'session', 'offer']);
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
            'event' => $this->event,
            'title' => __('ui.reviews.notifications.'.$this->event.'.title', [
                'teacher' => $this->review->teacher?->name,
                'student' => $this->review->student?->name,
                'rating' => $this->review->rating,
            ], $locale),
            'message' => __('ui.reviews.notifications.'.$this->event.'.message', [
                'teacher' => $this->review->teacher?->name,
                'student' => $this->review->student?->name,
                'session' => $this->review->session?->title,
                'rating' => $this->review->rating,
            ], $locale),
            'action_url' => $this->actionUrl($notifiable),
            'teacher_review_id' => $this->review->id,
            'teacher_user_id' => $this->review->teacher_user_id,
            'student_user_id' => $this->review->student_user_id,
            'status' => $this->review->status,
        ];
    }

    private function actionUrl(object $notifiable): string
    {
        if ((int) $notifiable->id === (int) $this->review->teacher_user_id) {
            return route('teacher.reviews.index');
        }

        return $this->review->teacher
            ? route('teachers.show', $this->review->teacher)
            : route('dashboard');
    }
}

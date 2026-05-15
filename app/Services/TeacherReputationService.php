<?php

namespace App\Services;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\TeacherReview;
use App\Models\TeachingOfferApplication;
use App\Models\User;
use Illuminate\Support\Collection;

class TeacherReputationService
{
    public const LABEL_NEW_TEACHER = 'new_teacher';

    public const LABEL_EXCELLENT = 'excellent';

    public const LABEL_RELIABLE = 'reliable';

    public const LABEL_NEEDS_ATTENTION = 'needs_attention';

    /**
     * @return array<string, mixed>
     */
    public function forTeacher(User|int $teacher): array
    {
        $teacherId = $teacher instanceof User ? $teacher->id : $teacher;

        return $this->forTeacherIds([$teacherId])[$teacherId] ?? $this->emptySummary();
    }

    /**
     * @param  iterable<int, User>  $teachers
     * @return array<int, array<string, mixed>>
     */
    public function forTeachers(iterable $teachers): array
    {
        $ids = collect($teachers)
            ->map(fn (User $teacher): int => (int) $teacher->id)
            ->values()
            ->all();

        return $this->forTeacherIds($ids);
    }

    /**
     * @param  array<int, int>  $teacherIds
     * @return array<int, array<string, mixed>>
     */
    public function forTeacherIds(array $teacherIds): array
    {
        $teacherIds = collect($teacherIds)
            ->map(fn (int|string $id): int => (int) $id)
            ->filter(fn (int $id): bool => $id > 0)
            ->unique()
            ->values();

        if ($teacherIds->isEmpty()) {
            return [];
        }

        $summaries = $teacherIds
            ->mapWithKeys(fn (int $id): array => [$id => $this->emptySummary()])
            ->all();

        $this->applyReviewMetrics($summaries, $teacherIds);
        $this->applySessionMetrics($summaries, $teacherIds);
        $this->applyStudentsHelped($summaries, $teacherIds);

        foreach ($summaries as $teacherId => $summary) {
            $summary['has_enough_data'] = ! (
                $summary['completed_sessions_count'] < 3
                && $summary['published_review_count'] < 3
            );
            $summary['reliability_label'] = $this->labelFor($summary);
            $summaries[$teacherId] = $summary;
        }

        return $summaries;
    }

    /**
     * @return array<string, mixed>
     */
    private function emptySummary(): array
    {
        return [
            'average_rating' => null,
            'published_review_count' => 0,
            'completed_sessions_count' => 0,
            'students_helped_count' => 0,
            'teaching_hours' => 0,
            'cancellation_rate' => 0.0,
            'no_show_rate' => 0.0,
            'reliability_label' => self::LABEL_NEW_TEACHER,
            'has_enough_data' => false,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>  $summaries
     * @param  Collection<int, int>  $teacherIds
     */
    private function applyReviewMetrics(array &$summaries, Collection $teacherIds): void
    {
        TeacherReview::query()
            ->publiclyVisible()
            ->whereIn('teacher_user_id', $teacherIds)
            ->selectRaw('teacher_user_id, count(*) as reviews_count, avg(rating) as average_rating')
            ->groupBy('teacher_user_id')
            ->get()
            ->each(function ($row) use (&$summaries): void {
                $teacherId = (int) $row->teacher_user_id;

                $summaries[$teacherId]['published_review_count'] = (int) $row->reviews_count;
                $summaries[$teacherId]['average_rating'] = round((float) $row->average_rating, 1);
            });
    }

    /**
     * @param  array<int, array<string, mixed>>  $summaries
     * @param  Collection<int, int>  $teacherIds
     */
    private function applySessionMetrics(array &$summaries, Collection $teacherIds): void
    {
        $relevantStatuses = [
            ClassSession::STATUS_COMPLETED,
            ClassSession::STATUS_CANCELLED,
            ClassSession::STATUS_NO_SHOW,
        ];
        $totalRelevant = [];
        $cancelled = [];
        $noShowSessionIds = [];
        $teachingMinutes = [];

        ClassSession::query()
            ->whereIn('teacher_user_id', $teacherIds)
            ->whereIn('status', $relevantStatuses)
            ->get(['id', 'teacher_user_id', 'status', 'starts_at', 'ends_at'])
            ->each(function (ClassSession $session) use (&$summaries, &$totalRelevant, &$cancelled, &$noShowSessionIds, &$teachingMinutes): void {
                $teacherId = (int) $session->teacher_user_id;
                $totalRelevant[$teacherId] = ($totalRelevant[$teacherId] ?? 0) + 1;

                if ($session->status === ClassSession::STATUS_COMPLETED) {
                    $summaries[$teacherId]['completed_sessions_count']++;

                    if ($session->starts_at && $session->ends_at && $session->ends_at->greaterThan($session->starts_at)) {
                        $teachingMinutes[$teacherId] = ($teachingMinutes[$teacherId] ?? 0)
                            + $session->starts_at->diffInMinutes($session->ends_at);
                    }
                }

                if ($session->status === ClassSession::STATUS_CANCELLED) {
                    $cancelled[$teacherId] = ($cancelled[$teacherId] ?? 0) + 1;
                }

                if ($session->status === ClassSession::STATUS_NO_SHOW) {
                    $noShowSessionIds[$teacherId][(int) $session->id] = true;
                }
            });

        ClassSessionAttendee::query()
            ->where('status', ClassSessionAttendee::STATUS_NO_SHOW)
            ->whereHas('session', fn ($query) => $query
                ->whereIn('teacher_user_id', $teacherIds)
                ->whereIn('status', $relevantStatuses))
            ->with('session:id,teacher_user_id')
            ->get(['id', 'class_session_id', 'status'])
            ->each(function (ClassSessionAttendee $attendee) use (&$noShowSessionIds): void {
                $teacherId = (int) $attendee->session?->teacher_user_id;

                if ($teacherId > 0) {
                    $noShowSessionIds[$teacherId][(int) $attendee->class_session_id] = true;
                }
            });

        foreach ($summaries as $teacherId => $summary) {
            $total = $totalRelevant[$teacherId] ?? 0;
            $noShows = isset($noShowSessionIds[$teacherId]) ? count($noShowSessionIds[$teacherId]) : 0;

            $summaries[$teacherId]['teaching_hours'] = (int) round(($teachingMinutes[$teacherId] ?? 0) / 60);
            $summaries[$teacherId]['cancellation_rate'] = $total > 0
                ? round((($cancelled[$teacherId] ?? 0) / $total) * 100, 1)
                : 0.0;
            $summaries[$teacherId]['no_show_rate'] = $total > 0
                ? round(($noShows / $total) * 100, 1)
                : 0.0;
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $summaries
     * @param  Collection<int, int>  $teacherIds
     */
    private function applyStudentsHelped(array &$summaries, Collection $teacherIds): void
    {
        $studentsByTeacher = [];

        ClassSessionAttendee::query()
            ->where('status', ClassSessionAttendee::STATUS_ATTENDED)
            ->whereHas('session', fn ($query) => $query
                ->whereIn('teacher_user_id', $teacherIds)
                ->where('status', ClassSession::STATUS_COMPLETED))
            ->with('session:id,teacher_user_id')
            ->get(['id', 'class_session_id', 'user_id'])
            ->each(function (ClassSessionAttendee $attendee) use (&$studentsByTeacher): void {
                $teacherId = (int) $attendee->session?->teacher_user_id;

                if ($teacherId > 0) {
                    $studentsByTeacher[$teacherId][(int) $attendee->user_id] = true;
                }
            });

        ClassSession::query()
            ->whereIn('teacher_user_id', $teacherIds)
            ->where('status', ClassSession::STATUS_COMPLETED)
            ->whereNotNull('application_id')
            ->whereDoesntHave('attendees')
            ->with('application:id,student_user_id,status')
            ->get(['id', 'teacher_user_id', 'application_id'])
            ->each(function (ClassSession $session) use (&$studentsByTeacher): void {
                if ($session->application?->status !== TeachingOfferApplication::STATUS_ACCEPTED) {
                    return;
                }

                $teacherId = (int) $session->teacher_user_id;
                $studentsByTeacher[$teacherId][(int) $session->application->student_user_id] = true;
            });

        foreach ($summaries as $teacherId => $summary) {
            $summaries[$teacherId]['students_helped_count'] = isset($studentsByTeacher[$teacherId])
                ? count($studentsByTeacher[$teacherId])
                : 0;
        }
    }

    /**
     * @param  array<string, mixed>  $summary
     */
    private function labelFor(array $summary): string
    {
        if (! $summary['has_enough_data']) {
            return self::LABEL_NEW_TEACHER;
        }

        $averageRating = $summary['average_rating'];

        if (
            $averageRating !== null
            && $averageRating >= 4.7
            && $summary['cancellation_rate'] <= 5
            && $summary['no_show_rate'] <= 3
        ) {
            return self::LABEL_EXCELLENT;
        }

        if (
            $averageRating !== null
            && $averageRating >= 4.0
            && $summary['cancellation_rate'] <= 15
            && $summary['no_show_rate'] <= 10
        ) {
            return self::LABEL_RELIABLE;
        }

        return self::LABEL_NEEDS_ATTENTION;
    }
}

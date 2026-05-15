<?php

namespace Tests\Feature;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\TeacherProfile;
use App\Models\TeacherReview;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Services\TeacherReputationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherReputationServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_reputation_uses_public_reviews_and_session_outcomes(): void
    {
        $teacher = $this->teacher();
        $offer = $this->offer($teacher);
        $student = User::factory()->create();
        $secondStudent = User::factory()->create();

        $publishedSession = $this->completedSession($teacher, $offer, $student);
        TeacherReview::create([
            'teacher_user_id' => $teacher->id,
            'student_user_id' => $student->id,
            'class_session_id' => $publishedSession->id,
            'teaching_offer_id' => $offer->id,
            'rating' => 5,
            'status' => TeacherReview::STATUS_PUBLISHED,
        ]);

        $hiddenSession = $this->completedSession($teacher, $offer, $secondStudent, 90);
        TeacherReview::create([
            'teacher_user_id' => $teacher->id,
            'student_user_id' => $secondStudent->id,
            'class_session_id' => $hiddenSession->id,
            'teaching_offer_id' => $offer->id,
            'rating' => 1,
            'status' => TeacherReview::STATUS_HIDDEN,
            'hidden_at' => now(),
        ]);

        $this->outcomeSession($teacher, $offer, ClassSession::STATUS_CANCELLED);
        $this->outcomeSession($teacher, $offer, ClassSession::STATUS_NO_SHOW, ClassSessionAttendee::STATUS_NO_SHOW);

        $summary = app(TeacherReputationService::class)->forTeacher($teacher);

        $this->assertSame(5.0, $summary['average_rating']);
        $this->assertSame(1, $summary['published_review_count']);
        $this->assertSame(2, $summary['completed_sessions_count']);
        $this->assertSame(2, $summary['students_helped_count']);
        $this->assertSame(3, $summary['teaching_hours']);
        $this->assertSame(25.0, $summary['cancellation_rate']);
        $this->assertSame(25.0, $summary['no_show_rate']);
        $this->assertSame(TeacherReputationService::LABEL_NEW_TEACHER, $summary['reliability_label']);
    }

    public function test_reputation_labels_follow_basic_thresholds(): void
    {
        $excellent = $this->teacher();
        $excellentOffer = $this->offer($excellent);
        $this->reviewedCompletedSessions($excellent, $excellentOffer, [5, 5, 5]);

        $reliable = $this->teacher();
        $reliableOffer = $this->offer($reliable);
        $this->reviewedCompletedSessions($reliable, $reliableOffer, [4, 4, 5, 4, 4, 4]);
        $this->outcomeSession($reliable, $reliableOffer, ClassSession::STATUS_CANCELLED);

        $needsAttention = $this->teacher();
        $needsAttentionOffer = $this->offer($needsAttention);
        $this->reviewedCompletedSessions($needsAttention, $needsAttentionOffer, [3, 3, 2]);

        $service = app(TeacherReputationService::class);

        $this->assertSame(TeacherReputationService::LABEL_EXCELLENT, $service->forTeacher($excellent)['reliability_label']);
        $this->assertSame(TeacherReputationService::LABEL_RELIABLE, $service->forTeacher($reliable)['reliability_label']);
        $this->assertSame(TeacherReputationService::LABEL_NEEDS_ATTENTION, $service->forTeacher($needsAttention)['reliability_label']);
    }

    private function teacher(): User
    {
        $teacher = User::factory()->create();
        TeacherProfile::create([
            'user_id' => $teacher->id,
            'is_active' => true,
            'is_accepting_requests' => true,
        ]);

        return $teacher;
    }

    private function offer(User $teacher): TeachingOffer
    {
        $category = TeachingCategory::create([
            'name' => 'Programming',
            'slug' => 'programming-'.uniqid(),
            'is_active' => true,
        ]);
        $subject = TeachingSubject::create([
            'teaching_category_id' => $category->id,
            'name' => 'Laravel',
            'slug' => 'laravel-'.uniqid(),
            'is_active' => true,
        ]);

        return TeachingOffer::create([
            'user_id' => $teacher->id,
            'teacher_profile_id' => $teacher->teacherProfile->id,
            'teaching_category_id' => $category->id,
            'teaching_subject_id' => $subject->id,
            'title' => 'Free Laravel basics',
            'slug' => 'free-laravel-basics-'.uniqid(),
            'summary' => 'Learn Laravel for free.',
            'description' => 'A free teaching offer for beginners.',
            'level' => TeachingOffer::LEVEL_BEGINNER,
            'teaching_mode' => TeachingOffer::MODE_SMALL_GROUP,
            'session_type' => TeachingOffer::SESSION_SCHEDULED_GROUP,
            'max_students' => 5,
            'duration_minutes' => 60,
            'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
            'timezone' => 'Europe/Madrid',
            'is_public' => true,
            'is_active' => true,
            'is_accepting_applications' => true,
            'published_at' => now(),
        ]);
    }

    private function completedSession(User $teacher, TeachingOffer $offer, User $student, int $minutes = 60): ClassSession
    {
        $startsAt = now()->subDays(random_int(1, 20))->setTime(10, 0);
        $session = ClassSession::create([
            'teaching_offer_id' => $offer->id,
            'teacher_user_id' => $teacher->id,
            'title' => 'Completed session '.uniqid(),
            'starts_at' => $startsAt,
            'ends_at' => (clone $startsAt)->addMinutes($minutes),
            'timezone' => 'Europe/Madrid',
            'capacity' => 5,
            'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
            'status' => ClassSession::STATUS_COMPLETED,
            'completed_at' => (clone $startsAt)->addMinutes($minutes),
        ]);

        ClassSessionAttendee::create([
            'class_session_id' => $session->id,
            'user_id' => $student->id,
            'status' => ClassSessionAttendee::STATUS_ATTENDED,
            'joined_at' => $startsAt,
        ]);

        return $session;
    }

    private function outcomeSession(User $teacher, TeachingOffer $offer, string $status, ?string $attendeeStatus = null): ClassSession
    {
        $startsAt = now()->subDays(random_int(1, 20))->setTime(12, 0);
        $session = ClassSession::create([
            'teaching_offer_id' => $offer->id,
            'teacher_user_id' => $teacher->id,
            'title' => 'Outcome session '.uniqid(),
            'starts_at' => $startsAt,
            'ends_at' => (clone $startsAt)->addHour(),
            'timezone' => 'Europe/Madrid',
            'capacity' => 5,
            'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
            'status' => $status,
            'cancelled_at' => $status === ClassSession::STATUS_CANCELLED ? now() : null,
            'no_show_marked_at' => $status === ClassSession::STATUS_NO_SHOW ? now() : null,
        ]);

        if ($attendeeStatus) {
            ClassSessionAttendee::create([
                'class_session_id' => $session->id,
                'user_id' => User::factory()->create()->id,
                'status' => $attendeeStatus,
                'joined_at' => $startsAt,
                'no_show_at' => $attendeeStatus === ClassSessionAttendee::STATUS_NO_SHOW ? now() : null,
            ]);
        }

        return $session;
    }

    /**
     * @param  array<int, int>  $ratings
     */
    private function reviewedCompletedSessions(User $teacher, TeachingOffer $offer, array $ratings): void
    {
        foreach ($ratings as $rating) {
            $student = User::factory()->create();
            $session = $this->completedSession($teacher, $offer, $student);
            TeacherReview::create([
                'teacher_user_id' => $teacher->id,
                'student_user_id' => $student->id,
                'class_session_id' => $session->id,
                'teaching_offer_id' => $offer->id,
                'rating' => $rating,
                'status' => TeacherReview::STATUS_PUBLISHED,
            ]);
        }
    }
}

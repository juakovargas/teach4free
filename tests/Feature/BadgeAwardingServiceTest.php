<?php

namespace Tests\Feature;

use App\Models\Badge;
use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\TeacherProfile;
use App\Models\TeacherReview;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Models\UserBadge;
use App\Services\BadgeAwardingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BadgeAwardingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_badge_awarding_uses_real_teacher_activity_without_duplicates(): void
    {
        $teacher = $this->teacher();
        $offer = $this->offer($teacher);

        foreach (range(1, 10) as $index) {
            $student = User::factory()->create();
            $session = $this->completedSession($teacher, $offer, $student);

            TeacherReview::create([
                'teacher_user_id' => $teacher->id,
                'student_user_id' => $student->id,
                'class_session_id' => $session->id,
                'teaching_offer_id' => $offer->id,
                'rating' => $index === 10 ? 4 : 5,
                'status' => TeacherReview::STATUS_PUBLISHED,
            ]);
        }

        $service = app(BadgeAwardingService::class);
        $awarded = $service->awardForTeacher($teacher, false);
        $keys = $teacher->userBadges()
            ->with('badge')
            ->get()
            ->pluck('badge.key')
            ->all();

        $this->assertGreaterThanOrEqual(5, $awarded->count());
        $this->assertContains(Badge::KEY_FIRST_CLASS_COMPLETED, $keys);
        $this->assertContains(Badge::KEY_TEN_STUDENTS_HELPED, $keys);
        $this->assertContains(Badge::KEY_RELIABLE_TEACHER, $keys);
        $this->assertContains(Badge::KEY_EXCELLENT_REVIEWS, $keys);
        $this->assertContains(Badge::KEY_PROGRAMMING_MENTOR, $keys);

        $countAfterFirstRun = $teacher->userBadges()->count();
        $service->awardForTeacher($teacher, false);

        $this->assertSame($countAfterFirstRun, $teacher->userBadges()->count());
    }

    public function test_teacher_cannot_feature_more_than_three_badges(): void
    {
        $teacher = $this->teacher();
        $service = app(BadgeAwardingService::class);
        $service->seedDefaultBadges(true);

        Badge::query()
            ->limit(4)
            ->get()
            ->each(fn (Badge $badge) => UserBadge::create([
                'user_id' => $teacher->id,
                'badge_id' => $badge->id,
                'awarded_at' => now(),
                'awarded_reason' => 'badges.award_reasons.'.$badge->key,
                'is_visible' => true,
                'is_featured' => false,
            ]));

        $payload = [
            'badges' => $teacher->userBadges()
                ->get()
                ->map(fn (UserBadge $badge): array => [
                    'id' => $badge->id,
                    'is_visible' => true,
                    'is_featured' => true,
                ])
                ->all(),
        ];

        $this->actingAs($teacher)
            ->put('/profile/teacher/badges', $payload)
            ->assertSessionHasErrors('badges');
    }

    private function teacher(): User
    {
        $teacher = User::factory()->create();
        TeacherProfile::create([
            'user_id' => $teacher->id,
            'is_active' => true,
            'is_accepting_requests' => true,
            'show_badges' => true,
            'show_reviews' => true,
            'show_reputation_summary' => true,
            'show_completed_sessions_count' => true,
            'show_students_helped_count' => true,
            'show_teaching_hours' => true,
            'show_location' => true,
            'show_availability_summary' => true,
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

    private function completedSession(User $teacher, TeachingOffer $offer, User $student): ClassSession
    {
        $startsAt = now()->subDays(random_int(1, 20))->setTime(10, 0);
        $session = ClassSession::create([
            'teaching_offer_id' => $offer->id,
            'teacher_user_id' => $teacher->id,
            'title' => 'Completed session '.uniqid(),
            'starts_at' => $startsAt,
            'ends_at' => (clone $startsAt)->addHour(),
            'timezone' => 'Europe/Madrid',
            'capacity' => 5,
            'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
            'status' => ClassSession::STATUS_COMPLETED,
            'completed_at' => (clone $startsAt)->addHour(),
        ]);

        ClassSessionAttendee::create([
            'class_session_id' => $session->id,
            'user_id' => $student->id,
            'status' => ClassSessionAttendee::STATUS_ATTENDED,
            'joined_at' => $startsAt,
        ]);

        return $session;
    }
}

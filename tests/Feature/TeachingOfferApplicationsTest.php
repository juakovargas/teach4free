<?php

namespace Tests\Feature;

use App\Models\Language;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Models\UserLanguage;
use App\Notifications\TeachingOfferApplicationNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TeachingOfferApplicationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_apply_to_offer(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);

        $this->post(route('offers.apply', $offer), [
            'message' => 'I want to learn.',
            'preferred_language_id' => $language->id,
        ])->assertRedirect(route('login'));
    }

    public function test_unverified_user_is_sent_to_verification_notice_before_applying(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->unverified()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);

        $this->actingAs($student)
            ->post(route('offers.apply', $offer), [
                'message' => 'I want to learn.',
                'preferred_language_id' => $language->id,
            ])
            ->assertRedirect(route('verification.notice'));
    }

    public function test_authenticated_user_can_apply_to_published_offer(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);

        $this->actingAs($student)
            ->post(route('offers.apply', $offer), [
                'message' => 'I want to learn Laravel.',
                'availability_note' => 'Weekday evenings.',
                'preferred_language_id' => $language->id,
            ])
            ->assertRedirect(route('my-applications.index'));

        $this->assertDatabaseHas('teaching_offer_applications', [
            'teaching_offer_id' => $offer->id,
            'student_user_id' => $student->id,
            'teacher_user_id' => $teacher->id,
            'status' => TeachingOfferApplication::STATUS_PENDING,
        ]);
        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $student->id,
            'is_active' => true,
        ]);
        $this->assertSame(1, $teacher->notifications()->count());
    }

    public function test_user_cannot_apply_to_own_offer_or_duplicate_active_application(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);

        $this->actingAs($teacher)
            ->post(route('offers.apply', $offer), [
                'message' => 'Applying to myself.',
                'preferred_language_id' => $language->id,
            ])
            ->assertSessionHasErrors('application');

        $student = User::factory()->create();
        TeachingOfferApplication::create([
            'teaching_offer_id' => $offer->id,
            'student_user_id' => $student->id,
            'teacher_user_id' => $teacher->id,
            'preferred_language_id' => $language->id,
            'status' => TeachingOfferApplication::STATUS_PENDING,
            'requested_at' => now(),
        ]);

        $this->actingAs($student)
            ->post(route('offers.apply', $offer), [
                'message' => 'Applying again.',
                'preferred_language_id' => $language->id,
            ])
            ->assertSessionHasErrors('application');
    }

    public function test_user_can_cancel_own_application_but_not_another_users_application(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $other = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);
        $application = $this->application($offer, $student, TeachingOfferApplication::STATUS_PENDING, $language);

        $this->actingAs($other)
            ->patch(route('my-applications.cancel', $application))
            ->assertForbidden();

        $this->actingAs($student)
            ->patch(route('my-applications.cancel', $application))
            ->assertRedirect();

        $this->assertDatabaseHas('teaching_offer_applications', [
            'id' => $application->id,
            'status' => TeachingOfferApplication::STATUS_CANCELLED,
        ]);
    }

    public function test_teacher_can_view_and_manage_only_applications_to_own_offers(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $otherTeacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);
        $application = $this->application($offer, $student, TeachingOfferApplication::STATUS_PENDING, $language);

        $this->actingAs($teacher)
            ->get(route('teacher.applications.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/applications/index')
                ->has('applications', 1)
            );

        $this->actingAs($otherTeacher)
            ->get(route('teacher.offers.applications.index', $offer))
            ->assertForbidden();

        $this->actingAs($teacher)
            ->patch(route('teacher.applications.accept', $application), [
                'teacher_response' => 'Welcome.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('teaching_offer_applications', [
            'id' => $application->id,
            'status' => TeachingOfferApplication::STATUS_ACCEPTED,
        ]);
        $this->assertSame(1, $student->notifications()->count());
    }

    public function test_teacher_can_reject_pending_application(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);
        $application = $this->application($offer, $student, TeachingOfferApplication::STATUS_PENDING, $language);

        $this->actingAs($teacher)
            ->patch(route('teacher.applications.reject', $application), [
                'teacher_response' => 'Not this time.',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('teaching_offer_applications', [
            'id' => $application->id,
            'status' => TeachingOfferApplication::STATUS_REJECTED,
        ]);
        $this->assertSame(1, $student->notifications()->count());
    }

    public function test_full_scheduled_group_uses_or_blocks_waiting_list(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $acceptedStudent = User::factory()->create();
        $waitlistedStudent = User::factory()->create();
        $blockedStudent = User::factory()->create();

        $waitlistOffer = $this->publishedOffer($teacher, $category, $subject, $language, [
            'slug' => 'with-waitlist',
            'max_students' => 1,
            'allow_waiting_list' => true,
        ]);
        $this->application($waitlistOffer, $acceptedStudent, TeachingOfferApplication::STATUS_ACCEPTED, $language);

        $this->actingAs($waitlistedStudent)
            ->post(route('offers.apply', $waitlistOffer), [
                'message' => 'Please waitlist me.',
                'preferred_language_id' => $language->id,
            ])
            ->assertRedirect(route('my-applications.index'));

        $this->assertDatabaseHas('teaching_offer_applications', [
            'teaching_offer_id' => $waitlistOffer->id,
            'student_user_id' => $waitlistedStudent->id,
            'status' => TeachingOfferApplication::STATUS_WAITLISTED,
        ]);

        $blockedOffer = $this->publishedOffer($teacher, $category, $subject, $language, [
            'slug' => 'without-waitlist',
            'max_students' => 1,
            'allow_waiting_list' => false,
        ]);
        $this->application($blockedOffer, $acceptedStudent, TeachingOfferApplication::STATUS_ACCEPTED, $language);

        $this->actingAs($blockedStudent)
            ->post(route('offers.apply', $blockedOffer), [
                'message' => 'Please add me.',
                'preferred_language_id' => $language->id,
            ])
            ->assertSessionHasErrors('application');
    }

    public function test_open_public_offer_signup_is_accepted_automatically(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language, [
            'session_type' => TeachingOffer::SESSION_OPEN_PUBLIC,
            'max_students' => 100,
            'meeting_tool' => TeachingOffer::TOOL_JITSI,
            'meeting_url' => 'https://meet.jit.si/free-demo',
        ]);

        $this->actingAs($student)
            ->post(route('offers.apply', $offer), [
                'message' => 'Joining.',
                'preferred_language_id' => $language->id,
            ])
            ->assertRedirect(route('my-applications.index'));

        $this->assertDatabaseHas('teaching_offer_applications', [
            'teaching_offer_id' => $offer->id,
            'student_user_id' => $student->id,
            'status' => TeachingOfferApplication::STATUS_ACCEPTED,
        ]);
    }

    public function test_private_meeting_url_is_not_shown_to_non_accepted_users(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language, [
            'meeting_tool' => TeachingOffer::TOOL_CUSTOM,
            'meeting_url' => 'https://example.com/private-room',
        ]);
        $this->application($offer, $student, TeachingOfferApplication::STATUS_PENDING, $language);

        $this->actingAs($student)
            ->get(route('offers.show', $offer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('visibleMeetingUrl', null));
    }

    public function test_student_teacher_and_admin_application_pages_are_scoped(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);
        $this->application($offer, $student, TeachingOfferApplication::STATUS_PENDING, $language);

        $this->actingAs($student)
            ->get(route('my-applications.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('applications', 1));

        $this->actingAs($admin)
            ->get(route('admin.applications.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/applications/index')
                ->has('applications', 1)
            );

        $this->actingAs($student)
            ->get(route('admin.applications.index'))
            ->assertForbidden();
    }

    public function test_notification_count_and_read_routes_are_scoped(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);

        $this->actingAs($student)
            ->post(route('offers.apply', $offer), [
                'message' => 'Please notify the teacher.',
                'preferred_language_id' => $language->id,
            ]);

        $notification = $teacher->notifications()->firstOrFail();

        $this->actingAs($teacher)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('notifications.unread_count', 1));

        $this->actingAs($student)
            ->patch(route('notifications.read', $notification))
            ->assertForbidden();

        $this->actingAs($teacher)
            ->patch(route('notifications.read', $notification))
            ->assertRedirect();

        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_application_events_send_mail_notifications(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $student = User::factory()->create();
        $offer = $this->publishedOffer($teacher, $category, $subject, $language);

        Notification::fake();

        $this->actingAs($student)
            ->post(route('offers.apply', $offer), [
                'message' => 'Please notify by mail.',
                'preferred_language_id' => $language->id,
            ]);

        Notification::assertSentTo(
            $teacher,
            TeachingOfferApplicationNotification::class,
            fn (TeachingOfferApplicationNotification $notification, array $channels) => in_array('mail', $channels, true),
        );

        $application = TeachingOfferApplication::firstOrFail();

        $this->actingAs($teacher)
            ->patch(route('teacher.applications.accept', $application));

        Notification::assertSentTo(
            $student,
            TeachingOfferApplicationNotification::class,
            fn (TeachingOfferApplicationNotification $notification, array $channels) => in_array('mail', $channels, true),
        );

        $this->actingAs($student)
            ->patch(route('my-applications.cancel', $application));

        Notification::assertSentTo(
            $teacher,
            TeachingOfferApplicationNotification::class,
            fn (TeachingOfferApplicationNotification $notification, array $channels) => in_array('mail', $channels, true),
        );
    }

    /**
     * @return array{TeachingCategory, TeachingSubject, Language}
     */
    private function catalog(): array
    {
        $language = Language::create([
            'code' => 'en',
            'name' => 'English',
            'native_name' => 'English',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $category = TeachingCategory::create([
            'name' => 'Programming',
            'slug' => 'programming',
            'is_active' => true,
        ]);
        $subject = TeachingSubject::create([
            'teaching_category_id' => $category->id,
            'name' => 'Laravel',
            'slug' => 'laravel',
            'is_active' => true,
        ]);

        return [$category, $subject, $language];
    }

    private function teacherWithLanguage(Language $language): User
    {
        $teacher = User::factory()->create();
        TeacherProfile::create(['user_id' => $teacher->id, 'is_active' => true, 'is_accepting_requests' => true]);
        UserLanguage::create([
            'user_id' => $teacher->id,
            'language_id' => $language->id,
            'understands' => true,
            'speaks' => true,
            'teaches' => true,
            'level' => UserLanguage::LEVEL_ADVANCED,
        ]);

        return $teacher;
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function publishedOffer(User $teacher, TeachingCategory $category, TeachingSubject $subject, Language $language, array $overrides = []): TeachingOffer
    {
        $profile = $teacher->teacherProfile()->first();
        $slug = $overrides['slug'] ?? 'free-laravel-basics';
        unset($overrides['slug']);

        $offer = TeachingOffer::create([
            'user_id' => $teacher->id,
            'teacher_profile_id' => $profile?->id,
            'teaching_category_id' => $category->id,
            'teaching_subject_id' => $subject->id,
            'title' => 'Free Laravel basics',
            'slug' => $slug,
            'summary' => 'Learn Laravel for free.',
            'description' => 'A free teaching offer for beginners.',
            'level' => TeachingOffer::LEVEL_BEGINNER,
            'teaching_mode' => TeachingOffer::MODE_SMALL_GROUP,
            'session_type' => TeachingOffer::SESSION_SCHEDULED_GROUP,
            'max_students' => 5,
            'duration_minutes' => 60,
            'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
            'meeting_url' => null,
            'timezone' => 'Europe/Madrid',
            'is_public' => true,
            'is_active' => true,
            'is_accepting_applications' => true,
            'allow_waiting_list' => true,
            'waiting_list_limit' => null,
            'published_at' => now(),
            ...$overrides,
        ]);
        $offer->languages()->sync([$language->id]);

        return $offer;
    }

    private function application(TeachingOffer $offer, User $student, string $status, Language $language): TeachingOfferApplication
    {
        StudentProfile::firstOrCreate([
            'user_id' => $student->id,
        ], [
            'current_level' => StudentProfile::LEVEL_MIXED,
            'preferred_learning_mode' => StudentProfile::MODE_ANY,
            'is_active' => true,
        ]);

        return TeachingOfferApplication::create([
            'teaching_offer_id' => $offer->id,
            'student_user_id' => $student->id,
            'teacher_user_id' => $offer->user_id,
            'preferred_language_id' => $language->id,
            'status' => $status,
            'message' => 'Test application message.',
            'requested_at' => now(),
            'accepted_at' => $status === TeachingOfferApplication::STATUS_ACCEPTED ? now() : null,
        ]);
    }
}

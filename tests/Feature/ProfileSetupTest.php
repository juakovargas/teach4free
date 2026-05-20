<?php

namespace Tests\Feature;

use App\Models\Language;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Models\UserLanguage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfileSetupTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_access_profile_setup_pages(): void
    {
        $this->get(route('profile.preferences.edit'))->assertRedirect(route('login'));
        $this->get(route('profile.student.edit'))->assertRedirect(route('login'));
        $this->get(route('profile.teacher.edit'))->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_preferences_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('profile.preferences.edit'))
            ->assertOk();
    }

    public function test_authenticated_user_can_update_preferences(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('profile.preferences.update'), [
                'name' => 'Updated User',
                'preferred_locale' => 'es',
                'timezone' => 'Europe/Madrid',
                'bio' => 'A short public bio.',
                'is_public' => true,
                'learning_interests' => 'Laravel basics',
                'teaching_interests' => 'React fundamentals',
                'languages' => [],
            ])
            ->assertRedirect();

        $user->refresh();

        $this->assertSame('Updated User', $user->name);
        $this->assertSame('es', $user->preferred_locale);
        $this->assertSame('Europe/Madrid', $user->timezone);
        $this->assertSame('Laravel basics', $user->learning_interests);
    }

    public function test_user_language_preferences_can_be_saved_and_teaches_implies_speaks(): void
    {
        $user = User::factory()->create();
        $english = Language::create([
            'code' => 'en',
            'name' => 'English',
            'native_name' => 'English',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->actingAs($user)
            ->put(route('profile.preferences.update'), [
                'name' => $user->name,
                'preferred_locale' => 'en',
                'timezone' => 'Europe/Madrid',
                'bio' => null,
                'is_public' => true,
                'learning_interests' => null,
                'teaching_interests' => null,
                'languages' => [
                    [
                        'language_id' => $english->id,
                        'understands' => true,
                        'speaks' => false,
                        'teaches' => true,
                        'level' => UserLanguage::LEVEL_ADVANCED,
                    ],
                ],
            ])
            ->assertRedirect();

        $preference = UserLanguage::firstWhere([
            'user_id' => $user->id,
            'language_id' => $english->id,
        ]);

        $this->assertTrue($preference->teaches);
        $this->assertTrue($preference->speaks);
    }

    public function test_authenticated_user_can_view_learning_profile_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('profile.student.edit'))
            ->assertOk();
    }

    public function test_authenticated_user_can_update_learning_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('profile.student.update'), [
                'learning_goals' => 'Practice conversation.',
                'current_level' => StudentProfile::LEVEL_BEGINNER,
                'preferred_learning_mode' => StudentProfile::MODE_ONE_TO_ONE,
                'availability_notes' => 'Evenings.',
                'is_active' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('student_profiles', [
            'user_id' => $user->id,
            'learning_goals' => 'Practice conversation.',
            'current_level' => StudentProfile::LEVEL_BEGINNER,
            'preferred_learning_mode' => StudentProfile::MODE_ONE_TO_ONE,
            'is_active' => true,
        ]);
    }

    public function test_authenticated_user_can_view_teacher_profile_page(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('profile.teacher.edit'))
            ->assertOk();
    }

    public function test_authenticated_user_can_activate_and_pause_teacher_profile(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('profile.teacher.activate'))
            ->assertRedirect();

        $this->assertDatabaseHas('teacher_profiles', [
            'user_id' => $user->id,
            'is_active' => true,
            'is_accepting_requests' => true,
        ]);

        $this->actingAs($user)
            ->post(route('profile.teacher.pause'))
            ->assertRedirect();

        $this->assertDatabaseHas('teacher_profiles', [
            'user_id' => $user->id,
            'is_active' => false,
            'is_accepting_requests' => false,
        ]);
    }

    public function test_authenticated_user_can_update_teacher_profile(): void
    {
        $user = User::factory()->create();
        TeacherProfile::create(['user_id' => $user->id, 'is_active' => true]);

        $this->actingAs($user)
            ->put(route('profile.teacher.update'), [
                'headline' => 'Laravel mentor',
                'public_intro' => 'Friendly public intro for new learners.',
                'teaching_bio' => 'I help beginners.',
                'experience_summary' => 'Several years of web practice.',
                'profile_accent_color' => '#2563EB',
                'preferred_teaching_mode' => TeacherProfile::MODE_MENTORING,
                'max_students_per_session' => 5,
                'default_session_duration_minutes' => 45,
                'meeting_tool' => TeacherProfile::TOOL_CUSTOM,
                'meeting_url' => 'https://example.com/free-meeting',
                'is_accepting_requests' => true,
                'show_badges' => true,
                'show_reviews' => false,
                'show_reputation_summary' => true,
                'show_completed_sessions_count' => true,
                'show_students_helped_count' => false,
                'show_teaching_hours' => true,
                'show_location' => false,
                'show_availability_summary' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('teacher_profiles', [
            'user_id' => $user->id,
            'headline' => 'Laravel mentor',
            'public_intro' => 'Friendly public intro for new learners.',
            'profile_accent_color' => '#2563EB',
            'meeting_tool' => TeacherProfile::TOOL_CUSTOM,
            'meeting_url' => 'https://example.com/free-meeting',
            'is_accepting_requests' => true,
            'show_reviews' => false,
            'show_location' => false,
        ]);
    }

    public function test_invalid_teacher_profile_accent_color_is_rejected(): void
    {
        $user = User::factory()->create();
        TeacherProfile::create(['user_id' => $user->id, 'is_active' => true]);

        $this->actingAs($user)
            ->put(route('profile.teacher.update'), [
                'headline' => 'Laravel mentor',
                'public_intro' => null,
                'teaching_bio' => 'I help beginners.',
                'experience_summary' => null,
                'profile_accent_color' => 'blue',
                'preferred_teaching_mode' => TeacherProfile::MODE_MENTORING,
                'max_students_per_session' => 5,
                'default_session_duration_minutes' => 45,
                'meeting_tool' => TeacherProfile::TOOL_NOT_DECIDED,
                'meeting_url' => null,
                'is_accepting_requests' => true,
                'show_badges' => true,
                'show_reviews' => true,
                'show_reputation_summary' => true,
                'show_completed_sessions_count' => true,
                'show_students_helped_count' => true,
                'show_teaching_hours' => true,
                'show_location' => true,
                'show_availability_summary' => true,
            ])
            ->assertSessionHasErrors('profile_accent_color');
    }

    public function test_authenticated_user_can_upload_and_remove_teacher_banner(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('profile.teacher.banner.update'), [
                'banner' => UploadedFile::fake()->image('teacher-banner.jpg', 1600, 500),
            ])
            ->assertRedirect();

        $profile = TeacherProfile::firstWhere('user_id', $user->id);

        $this->assertNotNull($profile?->banner_path);
        $this->assertStringStartsWith('banners/teachers/', $profile->banner_path);
        $this->assertStringStartsWith('/storage/banners/teachers/', $profile->banner);
        $this->assertSame(Storage::disk('public')->url($profile->banner_path), $profile->banner);
        Storage::disk('public')->assertExists($profile->banner_path);

        $path = $profile->banner_path;

        $this->actingAs($user)
            ->delete(route('profile.teacher.banner.destroy'))
            ->assertRedirect();

        $this->assertDatabaseHas('teacher_profiles', [
            'user_id' => $user->id,
            'banner_path' => null,
        ]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_public_teacher_profile_respects_customization_visibility(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('banners/teachers/custom-banner.jpg', 'banner');

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
        $teacher = User::factory()->create([
            'city' => 'Madrid',
            'country_code' => 'ES',
        ]);
        $profile = TeacherProfile::create([
            'user_id' => $teacher->id,
            'headline' => 'Free Laravel mentor',
            'public_intro' => 'Short intro near the top.',
            'teaching_bio' => 'Longer teaching bio.',
            'banner_path' => 'banners/teachers/custom-banner.jpg',
            'profile_accent_color' => '#2563EB',
            'is_active' => true,
            'is_accepting_requests' => true,
            'show_badges' => false,
            'show_reviews' => false,
            'show_reputation_summary' => false,
            'show_completed_sessions_count' => false,
            'show_students_helped_count' => false,
            'show_teaching_hours' => false,
            'show_location' => false,
            'show_availability_summary' => false,
        ]);
        UserLanguage::create([
            'user_id' => $teacher->id,
            'language_id' => $language->id,
            'understands' => true,
            'speaks' => true,
            'teaches' => true,
            'level' => UserLanguage::LEVEL_ADVANCED,
        ]);
        $offer = TeachingOffer::create([
            'user_id' => $teacher->id,
            'teacher_profile_id' => $profile->id,
            'teaching_category_id' => $category->id,
            'teaching_subject_id' => $subject->id,
            'title' => 'Free Laravel basics',
            'slug' => 'free-laravel-basics',
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
        $offer->languages()->sync([$language->id]);

        $this->get(route('teachers.show', $teacher))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teachers/show')
                ->where('teacher.banner', Storage::disk('public')->url('banners/teachers/custom-banner.jpg'))
                ->where('teacher.public_intro', 'Short intro near the top.')
                ->where('teacher.profile_accent_color', '#2563EB')
                ->where('teacher.city', null)
                ->where('teacher.country_code', null)
                ->where('teacher.visibility.show_badges', false)
                ->where('teacher.visibility.show_reviews', false)
                ->where('teacher.visibility.show_reputation_summary', false)
                ->where('teacher.visibility.show_availability_summary', false)
                ->where('reputationSummary', null)
                ->has('reviews', 0)
                ->has('offers', 1)
                ->where('offers.0.slug', 'free-laravel-basics')
            );
    }
}

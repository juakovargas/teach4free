<?php

namespace Tests\Feature;

use App\Models\Language;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Models\UserLanguage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
                'teaching_bio' => 'I help beginners.',
                'experience_summary' => 'Several years of web practice.',
                'preferred_teaching_mode' => TeacherProfile::MODE_MENTORING,
                'max_students_per_session' => 5,
                'default_session_duration_minutes' => 45,
                'meeting_tool' => TeacherProfile::TOOL_CUSTOM,
                'meeting_url' => 'https://example.com/free-meeting',
                'is_accepting_requests' => true,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('teacher_profiles', [
            'user_id' => $user->id,
            'headline' => 'Laravel mentor',
            'meeting_tool' => TeacherProfile::TOOL_CUSTOM,
            'meeting_url' => 'https://example.com/free-meeting',
            'is_accepting_requests' => true,
        ]);
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
}

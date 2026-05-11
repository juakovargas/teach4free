<?php

namespace Tests\Feature;

use App\Models\Language;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminProfileCountsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_shows_profile_counts(): void
    {
        $admin = User::factory()->admin()->create();
        $googleUser = User::factory()->create(['google_id' => 'google-123']);
        $student = User::factory()->create();
        $teacher = User::factory()->create();

        Language::create(['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'is_active' => true]);
        StudentProfile::create(['user_id' => $student->id, 'is_active' => true]);
        TeacherProfile::create(['user_id' => $teacher->id, 'is_active' => true, 'is_verified' => false]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/dashboard')
                ->where('stats.total_users', 4)
                ->where('stats.active_students', 1)
                ->where('stats.active_teachers', 1)
                ->where('stats.active_languages', 1)
                ->where('stats.google_users', 1)
                ->where('stats.pending_teacher_verifications', 1)
            );

        $this->assertSame('google-123', $googleUser->fresh()->google_id);
    }
}

<?php

namespace Tests\Feature;

use App\Models\Language;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_categories_and_non_admin_cannot(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->get(route('admin.categories.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/categories/index'));

        $this->actingAs($user)
            ->get(route('admin.categories.index'))
            ->assertForbidden();
    }

    public function test_admin_can_create_category_and_subject(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.categories.store'), [
                'name' => 'Programming',
                'slug' => 'programming',
                'description' => 'Free programming help.',
                'color' => '#0f766e',
                'icon' => 'code',
                'is_active' => true,
                'sort_order' => 1,
            ])
            ->assertRedirect(route('admin.categories.index'));

        $category = TeachingCategory::firstOrFail();

        $this->actingAs($admin)
            ->post(route('admin.subjects.store'), [
                'teaching_category_id' => $category->id,
                'name' => 'Laravel',
                'slug' => 'laravel',
                'description' => 'Laravel basics.',
                'is_active' => true,
                'sort_order' => 1,
            ])
            ->assertRedirect(route('admin.subjects.index'));

        $this->assertDatabaseHas('teaching_subjects', [
            'teaching_category_id' => $category->id,
            'slug' => 'laravel',
        ]);
    }

    public function test_admin_can_view_all_teaching_offers(): void
    {
        $admin = User::factory()->admin()->create();
        $teacher = User::factory()->create();
        $language = Language::create(['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'is_active' => true]);
        $category = TeachingCategory::create(['name' => 'Programming', 'slug' => 'programming', 'is_active' => true]);
        $subject = TeachingSubject::create(['teaching_category_id' => $category->id, 'name' => 'Laravel', 'slug' => 'laravel', 'is_active' => true]);
        $profile = TeacherProfile::create(['user_id' => $teacher->id, 'is_active' => true]);
        $offer = TeachingOffer::create([
            'user_id' => $teacher->id,
            'teacher_profile_id' => $profile->id,
            'teaching_category_id' => $category->id,
            'teaching_subject_id' => $subject->id,
            'title' => 'Free Laravel basics',
            'slug' => 'free-laravel-basics',
            'summary' => 'Learn for free.',
            'description' => 'Free class.',
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

        $this->actingAs($admin)
            ->get(route('admin.teaching-offers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/teaching-offers/index')
                ->has('offers', 1)
                ->where('offers.0.slug', 'free-laravel-basics')
            );
    }
}

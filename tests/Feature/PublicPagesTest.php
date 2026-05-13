<?php

namespace Tests\Feature;

use App\Models\Language;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Models\UserLanguage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicPagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_home_page(): void
    {
        $response = $this->get(route('home'));

        $response->assertOk();
    }

    public function test_guest_can_view_about_page(): void
    {
        $response = $this->get(route('about'));

        $response->assertOk();
    }

    public function test_guest_can_view_legal_content_pages(): void
    {
        foreach (['terms', 'privacy', 'community-guidelines', 'teacher-guidelines', 'free-learning-rules'] as $routeName) {
            $this->get(route($routeName))
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page->component('content/show'));
        }
    }

    public function test_guest_can_browse_public_teachers(): void
    {
        [$category, $subject, $language] = $this->catalog();
        [$teacher, $profile] = $this->activeTeacher($language, [
            'name' => 'Free Math Mentor',
            'city' => 'Paris',
            'country_code' => 'FR',
        ], [
            'headline' => 'Friendly free math help',
            'teaching_bio' => 'I help learners practice algebra and problem solving for free.',
        ]);
        $offer = $this->publishedOffer($teacher, $profile, $category, $subject, [
            'title' => 'Free algebra practice',
            'slug' => 'free-algebra-practice',
        ]);
        $offer->languages()->sync([$language->id]);

        $this->get(route('teachers.index', ['language' => $language->code]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teachers/index')
                ->has('teachers', 1)
                ->where('teachers.0.name', 'Free Math Mentor')
                ->where('teachers.0.active_offers_count', 1)
                ->where('teachers.0.profile_url', route('teachers.show', $teacher))
            );
    }

    public function test_guest_can_view_active_teacher_profile_with_offers(): void
    {
        [$category, $subject, $language] = $this->catalog();
        [$teacher, $profile] = $this->activeTeacher($language, [
            'name' => 'Open Science Teacher',
            'city' => 'Lyon',
            'country_code' => 'FR',
        ], [
            'headline' => 'Science mentoring for curious learners',
            'teaching_bio' => 'I share practical science explanations in free sessions.',
            'experience_summary' => 'Five years mentoring beginners.',
        ]);
        $offer = $this->publishedOffer($teacher, $profile, $category, $subject, [
            'title' => 'Free science basics',
            'slug' => 'free-science-basics',
        ]);
        $offer->languages()->sync([$language->id]);

        $this->get(route('teachers.show', $teacher))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teachers/show')
                ->where('teacher.name', 'Open Science Teacher')
                ->where('teacher.headline', 'Science mentoring for curious learners')
                ->missing('teacher.email')
                ->has('offers', 1)
                ->where('offers.0.slug', 'free-science-basics')
            );
    }

    public function test_guest_cannot_view_inactive_teacher_profile(): void
    {
        $teacher = User::factory()->create();
        TeacherProfile::create([
            'user_id' => $teacher->id,
            'headline' => 'Hidden teacher',
            'is_active' => false,
        ]);

        $this->get(route('teachers.show', $teacher))->assertNotFound();
    }

    public function test_offer_detail_links_to_public_teacher_profile(): void
    {
        [$category, $subject, $language] = $this->catalog();
        [$teacher, $profile] = $this->activeTeacher($language);
        $offer = $this->publishedOffer($teacher, $profile, $category, $subject, [
            'slug' => 'teacher-linked-offer',
        ]);
        $offer->languages()->sync([$language->id]);

        $this->get(route('offers.show', $offer))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('offers/show')
                ->where('offer.user.profile_url', route('teachers.show', $teacher))
                ->missing('offer.user.email')
            );
    }

    public function test_home_shows_featured_teachers_and_prioritizes_current_language_offers(): void
    {
        $english = Language::create([
            'code' => 'en',
            'name' => 'English',
            'native_name' => 'English',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $spanish = Language::create([
            'code' => 'es',
            'name' => 'Spanish',
            'native_name' => 'Espanol',
            'is_active' => true,
            'sort_order' => 2,
        ]);
        $category = TeachingCategory::create([
            'name' => 'Languages',
            'slug' => 'languages',
            'is_active' => true,
        ]);
        $subject = TeachingSubject::create([
            'teaching_category_id' => $category->id,
            'name' => 'Conversation',
            'slug' => 'conversation',
            'is_active' => true,
        ]);
        $teacher = User::factory()->create([
            'name' => 'Spanish Mentor',
            'city' => 'Madrid',
            'country_code' => 'ES',
        ]);

        $profile = TeacherProfile::create([
            'user_id' => $teacher->id,
            'headline' => 'Free conversation practice',
            'is_active' => true,
            'is_accepting_requests' => true,
        ]);
        UserLanguage::create([
            'user_id' => $teacher->id,
            'language_id' => $spanish->id,
            'understands' => true,
            'speaks' => true,
            'teaches' => true,
            'level' => UserLanguage::LEVEL_ADVANCED,
        ]);

        $spanishOffer = $this->publishedOffer($teacher, $profile, $category, $subject, [
            'title' => 'Spanish open practice',
            'slug' => 'spanish-open-practice',
            'session_type' => TeachingOffer::SESSION_OPEN_PUBLIC,
            'published_at' => now()->subDay(),
        ]);
        $spanishOffer->languages()->sync([$spanish->id]);

        $englishOffer = $this->publishedOffer($teacher, $profile, $category, $subject, [
            'title' => 'English fallback practice',
            'slug' => 'english-fallback-practice',
            'published_at' => now(),
        ]);
        $englishOffer->languages()->sync([$english->id]);

        $this->withHeader('Accept-Language', 'es')
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('currentLanguage.code', 'es')
                ->where('featuredTeachers.0.name', 'Spanish Mentor')
                ->where('featuredOffers.0.slug', 'spanish-open-practice')
                ->where('featuredOffers.1.slug', 'english-fallback-practice')
                ->where('stats.teachers', 1)
                ->where('stats.offers', 2)
            );
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function publishedOffer(
        User $teacher,
        TeacherProfile $profile,
        TeachingCategory $category,
        TeachingSubject $subject,
        array $overrides = [],
    ): TeachingOffer {
        return TeachingOffer::create([
            'user_id' => $teacher->id,
            'teacher_profile_id' => $profile->id,
            'teaching_category_id' => $category->id,
            'teaching_subject_id' => $subject->id,
            'title' => 'Free language practice',
            'slug' => 'free-language-practice',
            'summary' => 'Practice with a free community teacher.',
            'description' => 'A public offer created for public page discovery tests.',
            'level' => TeachingOffer::LEVEL_BEGINNER,
            'teaching_mode' => TeachingOffer::MODE_SMALL_GROUP,
            'session_type' => TeachingOffer::SESSION_SCHEDULED_GROUP,
            'max_students' => 5,
            'duration_minutes' => 60,
            'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
            'timezone' => 'Europe/Madrid',
            'availability_summary' => 'Weekday evenings.',
            'is_public' => true,
            'is_active' => true,
            'is_accepting_applications' => true,
            'published_at' => now(),
            ...$overrides,
        ]);
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
            'name' => 'Science',
            'slug' => 'science',
            'is_active' => true,
        ]);
        $subject = TeachingSubject::create([
            'teaching_category_id' => $category->id,
            'name' => 'Basics',
            'slug' => 'basics',
            'is_active' => true,
        ]);

        return [$category, $subject, $language];
    }

    /**
     * @param  array<string, mixed>  $userOverrides
     * @param  array<string, mixed>  $profileOverrides
     * @return array{User, TeacherProfile}
     */
    private function activeTeacher(Language $language, array $userOverrides = [], array $profileOverrides = []): array
    {
        $teacher = User::factory()->create([
            'name' => 'Community Teacher',
            ...$userOverrides,
        ]);
        $profile = TeacherProfile::create([
            'user_id' => $teacher->id,
            'headline' => 'Free community mentoring',
            'teaching_bio' => 'I help learners for free through Teach4Free.',
            'is_active' => true,
            'is_accepting_requests' => true,
            ...$profileOverrides,
        ]);
        UserLanguage::create([
            'user_id' => $teacher->id,
            'language_id' => $language->id,
            'understands' => true,
            'speaks' => true,
            'teaches' => true,
            'level' => UserLanguage::LEVEL_ADVANCED,
        ]);

        return [$teacher, $profile];
    }
}

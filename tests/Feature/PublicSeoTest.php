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

class PublicSeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_page_has_public_seo_metadata(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('welcome')
                ->where('seo.title', 'Teach4Free - Learn and teach online for free')
                ->where('seo.canonicalUrl', route('home'))
                ->where('seo.robots', 'index,follow')
                ->where('seo.structuredData.0.@type', 'Organization')
                ->where('seo.structuredData.1.@type', 'WebSite')
            );
    }

    public function test_offer_detail_has_dynamic_seo_and_course_schema(): void
    {
        [$teacher, $offer] = $this->publishedOfferFixture('free-public-seo-class');

        $this->get(route('offers.show', $offer))
            ->assertOk()
            ->assertDontSee($teacher->email, false)
            ->assertInertia(fn (Assert $page) => $page
                ->component('offers/show')
                ->where('seo.title', 'Free Public SEO Class - Free class on Teach4Free')
                ->where('seo.canonicalUrl', route('offers.show', $offer))
                ->where('seo.structuredData.0.@type', 'Course')
                ->where('seo.structuredData.0.name', 'Free Public SEO Class')
            );
    }

    public function test_teacher_profile_has_dynamic_seo_and_safe_person_schema(): void
    {
        [$teacher] = $this->publishedOfferFixture('profile-schema-class');

        $this->get(route('teachers.show', $teacher))
            ->assertOk()
            ->assertDontSee($teacher->email, false)
            ->assertInertia(fn (Assert $page) => $page
                ->component('teachers/show')
                ->where('seo.title', 'Public SEO Teacher - Free teacher on Teach4Free')
                ->where('seo.canonicalUrl', route('teachers.show', $teacher))
                ->where('seo.structuredData.0.@type', 'Person')
                ->where('seo.structuredData.0.name', 'Public SEO Teacher')
                ->missing('seo.structuredData.0.email')
            );
    }

    public function test_sitemap_contains_public_urls_only(): void
    {
        [, $offer] = $this->publishedOfferFixture('sitemap-public-class');
        $inactiveOffer = $this->inactiveOfferFixture();

        $response = $this->get(route('sitemap'));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $response->assertSee(route('home'), false);
        $response->assertSee(route('offers.index'), false);
        $response->assertSee(route('offers.show', $offer), false);
        $response->assertDontSee(route('offers.show', $inactiveOffer), false);
        $response->assertDontSee('/admin', false);
        $response->assertDontSee('/profile', false);
        $response->assertDontSee('/messages', false);
    }

    public function test_robots_txt_references_sitemap_and_private_blocks(): void
    {
        $response = $this->get(route('robots'));

        $response->assertOk();
        $response->assertSee('User-agent: *', false);
        $response->assertSee('Disallow: /admin/', false);
        $response->assertSee('Disallow: /profile/', false);
        $response->assertSee('Disallow: /teacher/', false);
        $response->assertSee('Sitemap: '.route('sitemap'), false);
        $response->assertDontSee('Disallow: /offers', false);
        $response->assertDontSee('Disallow: /teachers', false);
    }

    public function test_private_and_admin_pages_send_noindex_header(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    /**
     * @return array{User, TeachingOffer}
     */
    private function publishedOfferFixture(string $slug): array
    {
        $language = Language::firstOrCreate([
            'code' => 'en',
        ], [
            'code' => 'en',
            'name' => 'English',
            'native_name' => 'English',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $category = TeachingCategory::firstOrCreate([
            'slug' => 'programming',
        ], [
            'name' => 'Programming',
            'slug' => 'programming',
            'is_active' => true,
        ]);
        $subject = TeachingSubject::firstOrCreate([
            'slug' => 'seo-basics',
        ], [
            'teaching_category_id' => $category->id,
            'name' => 'SEO basics',
            'slug' => 'seo-basics',
            'is_active' => true,
        ]);
        $teacher = User::factory()->create([
            'name' => 'Public SEO Teacher',
            'email' => "{$slug}@example.com",
        ]);
        $profile = TeacherProfile::create([
            'user_id' => $teacher->id,
            'headline' => 'Free SEO learning help',
            'public_intro' => 'I help learners understand public SEO foundations for free.',
            'teaching_bio' => 'I teach practical search basics and public web metadata without charging learners.',
            'is_active' => true,
            'is_accepting_requests' => true,
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
            'title' => $slug === 'free-public-seo-class'
                ? 'Free Public SEO Class'
                : str($slug)->headline()->toString(),
            'slug' => $slug,
            'summary' => 'Learn practical public metadata and SEO basics for free.',
            'description' => 'A public free class about safe metadata, sitemap and structured data foundations.',
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
        ]);
        $offer->languages()->sync([$language->id]);

        return [$teacher, $offer];
    }

    private function inactiveOfferFixture(): TeachingOffer
    {
        [, $offer] = $this->publishedOfferFixture('inactive-sitemap-class');
        $offer->forceFill([
            'is_public' => false,
            'is_active' => false,
        ])->save();

        return $offer;
    }
}

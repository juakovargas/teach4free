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

class TeachingOffersTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_public_offers_page(): void
    {
        $this->get(route('offers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('offers/index'));
    }

    public function test_guest_can_filter_offers_by_category_language_and_level(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);

        $offer = $this->publishedOffer($teacher, $category, $subject, $language, [
            'level' => TeachingOffer::LEVEL_BEGINNER,
        ]);

        $this->get(route('offers.index', [
            'category' => $category->slug,
            'language' => $language->code,
            'level' => TeachingOffer::LEVEL_BEGINNER,
        ]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('offers/index')
                ->has('offers', 1)
                ->where('offers.0.slug', $offer->slug)
            );
    }

    public function test_guest_can_clear_language_filter_and_view_all_offers(): void
    {
        [$category, $subject, $english] = $this->catalog();
        $french = Language::create([
            'code' => 'fr',
            'name' => 'French',
            'native_name' => 'Francais',
            'is_active' => true,
            'sort_order' => 2,
        ]);
        $englishTeacher = $this->teacherWithLanguage($english);
        $frenchTeacher = $this->teacherWithLanguage($french);

        $englishOffer = $this->publishedOffer($englishTeacher, $category, $subject, $english, [
            'published_at' => now()->subDay(),
        ]);
        $frenchOffer = $this->publishedOffer($frenchTeacher, $category, $subject, $french, [
            'slug' => '-french',
            'title' => 'Free French basics',
        ]);

        $this->get(route('offers.index', ['language' => $english->code]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('offers', 1)
                ->where('offers.0.slug', $englishOffer->slug)
            );

        $this->get(route('offers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('offers', 2)
                ->where('offers.0.slug', $frenchOffer->slug)
                ->where('offers.1.slug', $englishOffer->slug)
            );
    }

    public function test_guest_can_filter_offers_by_teacher(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $otherTeacher = $this->teacherWithLanguage($language);

        $offer = $this->publishedOffer($teacher, $category, $subject, $language);
        $this->publishedOffer($otherTeacher, $category, $subject, $language, [
            'slug' => '-other-teacher',
            'title' => 'Another free Laravel offer',
        ]);

        $this->get(route('offers.index', ['teacher' => $teacher->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('offers', 1)
                ->where('offers.0.slug', $offer->slug)
                ->where('filteredTeacher.id', $teacher->id)
            );
    }

    public function test_guest_can_view_published_offer_but_not_unpublished_offer(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);
        $published = $this->publishedOffer($teacher, $category, $subject, $language);
        $unpublished = $this->publishedOffer($teacher, $category, $subject, $language, [
            'slug' => 'hidden-offer',
            'is_active' => false,
        ]);

        $this->get(route('offers.show', $published))->assertOk();
        $this->get(route('offers.show', $unpublished))->assertNotFound();
    }

    public function test_user_without_active_teacher_profile_sees_guidance_when_creating_offer(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('teacher.offers.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('teacher/offers/not-ready'));
    }

    public function test_active_teacher_can_access_offer_create_page(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);

        $this->actingAs($teacher)
            ->get(route('teacher.offers.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/offers/form')
                ->has('categories', 1)
            );
    }

    public function test_teacher_can_create_and_edit_own_offer(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);

        $this->actingAs($teacher)
            ->post(route('teacher.offers.store'), $this->offerPayload($category, $subject, $language))
            ->assertRedirect(route('teacher.offers.index'));

        $offer = TeachingOffer::firstOrFail();

        $this->assertDatabaseHas('teaching_offers', [
            'id' => $offer->id,
            'user_id' => $teacher->id,
            'title' => 'Free Laravel basics',
            'is_public' => true,
            'is_active' => true,
        ]);
        $this->assertTrue($offer->languages()->whereKey($language->id)->exists());

        $this->actingAs($teacher)
            ->put(route('teacher.offers.update', $offer), [
                ...$this->offerPayload($category, $subject, $language),
                'title' => 'Updated free Laravel basics',
            ])
            ->assertRedirect(route('teacher.offers.index'));

        $this->assertDatabaseHas('teaching_offers', [
            'id' => $offer->id,
            'title' => 'Updated free Laravel basics',
        ]);
    }

    public function test_teacher_cannot_edit_another_users_offer(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $owner = $this->teacherWithLanguage($language);
        $other = $this->teacherWithLanguage($language);
        $offer = $this->publishedOffer($owner, $category, $subject, $language);

        $this->actingAs($other)
            ->get(route('teacher.offers.edit', $offer))
            ->assertForbidden();
    }

    public function test_published_offer_requires_at_least_one_language(): void
    {
        [$category, $subject, $language] = $this->catalog();
        $teacher = $this->teacherWithLanguage($language);

        $this->actingAs($teacher)
            ->post(route('teacher.offers.store'), [
                ...$this->offerPayload($category, $subject, $language),
                'language_ids' => [],
            ])
            ->assertSessionHasErrors('language_ids');
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
        $offer = TeachingOffer::create([
            'user_id' => $teacher->id,
            'teacher_profile_id' => $profile?->id,
            'teaching_category_id' => $category->id,
            'teaching_subject_id' => $subject->id,
            'title' => 'Free Laravel basics',
            'slug' => 'free-laravel-basics'.($overrides['slug'] ?? ''),
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
            ...$overrides,
        ]);
        $offer->languages()->sync([$language->id]);

        return $offer;
    }

    /**
     * @return array<string, mixed>
     */
    private function offerPayload(TeachingCategory $category, TeachingSubject $subject, Language $language): array
    {
        return [
            'title' => 'Free Laravel basics',
            'teaching_category_id' => $category->id,
            'teaching_subject_id' => $subject->id,
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
            'availability_summary' => 'Evenings.',
            'requirements' => null,
            'materials_summary' => null,
            'is_public' => true,
            'is_active' => true,
            'is_accepting_applications' => true,
            'language_ids' => [$language->id],
        ];
    }
}

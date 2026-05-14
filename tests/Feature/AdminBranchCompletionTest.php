<?php

namespace Tests\Feature;

use App\Models\CategoryProposal;
use App\Models\Incident;
use App\Models\PlatformTrackingSetting;
use App\Models\SubjectProposal;
use App\Models\TeachingCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminBranchCompletionTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_world_map_calendar_and_incidents_pages_load(): void
    {
        $admin = User::factory()->admin()->create();
        $incident = Incident::create([
            'type' => Incident::TYPE_PAYMENT_REQUEST,
            'status' => Incident::STATUS_OPEN,
            'priority' => Incident::PRIORITY_URGENT,
            'subject' => 'Teacher asked for payment',
            'description' => 'Payment requests are forbidden on Teach4Free.',
        ]);

        $this->actingAs($admin)
            ->get(route('admin.world-map'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/world-map')
                ->where('summary.total_located_users', 0)
            );

        $this->actingAs($admin)
            ->get(route('admin.calendar-overview'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('admin/calendar-overview'));

        $this->actingAs($admin)
            ->get(route('admin.incidents.index', ['type' => Incident::TYPE_PAYMENT_REQUEST]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/incidents/index')
                ->where('incidents.data.0.id', $incident->id)
            );
    }

    public function test_admin_can_save_tracking_settings(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->put(route('admin.analytics.update'), [
                'google_analytics_id' => 'G-TEST123',
                'google_tag_manager_id' => null,
                'meta_pixel_id' => null,
                'tiktok_pixel_id' => null,
                'linkedin_partner_id' => null,
                'microsoft_clarity_id' => null,
                'plausible_domain' => 'teach4free.test',
                'custom_head_script' => null,
                'custom_body_script' => null,
                'tracking_enabled' => true,
                'cookie_consent_required' => true,
            ])
            ->assertRedirect();

        $this->assertTrue(PlatformTrackingSetting::current()->tracking_enabled);
        $this->assertSame('G-TEST123', PlatformTrackingSetting::current()->google_analytics_id);
    }

    public function test_category_color_validation_accepts_hex_and_rejects_invalid_value(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->post(route('admin.categories.store'), [
                'name' => 'Data',
                'slug' => 'data',
                'description' => 'Free data help.',
                'color' => '#3B82F6',
                'icon' => 'chart',
                'is_active' => true,
                'sort_order' => 1,
            ])
            ->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('teaching_categories', ['slug' => 'data', 'color' => '#3B82F6']);

        $this->actingAs($admin)
            ->from(route('admin.categories.create'))
            ->post(route('admin.categories.store'), [
                'name' => 'Broken',
                'slug' => 'broken',
                'color' => 'blue',
                'is_active' => true,
                'sort_order' => 1,
            ])
            ->assertSessionHasErrors('color');
    }

    public function test_teacher_can_submit_category_and_subject_proposals(): void
    {
        $teacher = User::factory()->create();
        $category = TeachingCategory::create(['name' => 'Programming', 'slug' => 'programming', 'is_active' => true]);

        $this->actingAs($teacher)
            ->post(route('teacher.category-proposals.store'), [
                'name' => 'Open source',
                'description' => 'First contribution mentoring.',
                'suggested_color' => '#10B981',
            ])
            ->assertRedirect();

        $this->actingAs($teacher)
            ->post(route('teacher.subject-proposals.store'), [
                'name' => 'First issue practice',
                'description' => 'Preparing a first issue.',
                'teaching_category_id' => $category->id,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('category_proposals', ['name' => 'Open source', 'status' => CategoryProposal::STATUS_PENDING]);
        $this->assertDatabaseHas('subject_proposals', ['name' => 'First issue practice', 'status' => SubjectProposal::STATUS_PENDING]);
    }

    public function test_admin_can_approve_reject_and_merge_category_proposals(): void
    {
        $admin = User::factory()->admin()->create();
        $teacher = User::factory()->create();
        $existingCategory = TeachingCategory::create(['name' => 'Programming', 'slug' => 'programming', 'is_active' => true]);
        $approve = CategoryProposal::create(['proposed_by_user_id' => $teacher->id, 'name' => 'Data literacy', 'status' => CategoryProposal::STATUS_PENDING]);
        $reject = CategoryProposal::create(['proposed_by_user_id' => $teacher->id, 'name' => 'Too broad', 'status' => CategoryProposal::STATUS_PENDING]);
        $merge = CategoryProposal::create(['proposed_by_user_id' => $teacher->id, 'name' => 'Coding', 'status' => CategoryProposal::STATUS_PENDING]);

        $this->actingAs($admin)
            ->patch(route('admin.category-proposals.update', $approve), ['action' => 'approve'])
            ->assertRedirect();

        $this->actingAs($admin)
            ->patch(route('admin.category-proposals.update', $reject), ['action' => 'reject', 'admin_notes' => 'Too broad.'])
            ->assertRedirect();

        $this->actingAs($admin)
            ->patch(route('admin.category-proposals.update', $merge), ['action' => 'merge', 'existing_category_id' => $existingCategory->id])
            ->assertRedirect();

        $this->assertSame(CategoryProposal::STATUS_APPROVED, $approve->fresh()->status);
        $this->assertSame(CategoryProposal::STATUS_REJECTED, $reject->fresh()->status);
        $this->assertSame($existingCategory->id, $merge->fresh()->approved_category_id);
    }

    public function test_admin_can_approve_subject_proposal(): void
    {
        $admin = User::factory()->admin()->create();
        $teacher = User::factory()->create();
        $category = TeachingCategory::create(['name' => 'Programming', 'slug' => 'programming', 'is_active' => true]);
        $proposal = SubjectProposal::create([
            'proposed_by_user_id' => $teacher->id,
            'teaching_category_id' => $category->id,
            'name' => 'Debugging basics',
            'status' => SubjectProposal::STATUS_PENDING,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.subject-proposals.update', $proposal), ['action' => 'approve', 'teaching_category_id' => $category->id])
            ->assertRedirect();

        $this->assertDatabaseHas('teaching_subjects', [
            'teaching_category_id' => $category->id,
            'name' => 'Debugging basics',
        ]);
        $this->assertSame(SubjectProposal::STATUS_APPROVED, $proposal->fresh()->status);
    }
}

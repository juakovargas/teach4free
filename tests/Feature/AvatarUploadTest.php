<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AvatarUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_header_auth_payload_has_initials_fallback_when_user_has_no_avatar(): void
    {
        $user = User::factory()->create(['avatar_path' => null, 'avatar_url' => null]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.avatar', null)
                ->where('auth.user.name', $user->name)
            );
    }

    public function test_user_can_upload_and_remove_avatar(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('profile.preferences.avatar.update'), [
                'avatar' => UploadedFile::fake()->image('avatar.jpg', 256, 256),
            ])
            ->assertRedirect();

        $user->refresh();
        $this->assertNotNull($user->avatar_path);
        Storage::disk('public')->assertExists($user->avatar_path);

        $this->actingAs($user)
            ->delete(route('profile.preferences.avatar.destroy'))
            ->assertRedirect();

        $this->assertNull($user->fresh()->avatar_path);
    }
}

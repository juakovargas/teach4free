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
                ->where('auth.user.initials', $user->initials)
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
        $this->assertStringStartsWith('avatars/users/', $user->avatar_path);
        $this->assertStringStartsNotWith('C:\\', $user->avatar);
        $this->assertStringStartsNotWith('storage/app/', $user->avatar);
        $this->assertStringStartsNotWith('public/', $user->avatar);
        $this->assertStringStartsWith('/storage/avatars/users/', $user->avatar);
        $this->assertSame(Storage::disk('public')->url($user->avatar_path), $user->avatar);
        Storage::disk('public')->assertExists($user->avatar_path);
        $uploadedPath = $user->avatar_path;

        $this->actingAs($user)
            ->delete(route('profile.preferences.avatar.destroy'))
            ->assertRedirect();

        $this->assertNull($user->fresh()->avatar_path);
        Storage::disk('public')->assertMissing($uploadedPath);
    }

    public function test_uploaded_avatar_takes_priority_over_google_avatar_in_auth_payload(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/users/local-avatar.jpg', 'avatar');
        $user = User::factory()->create([
            'avatar_path' => 'avatars/users/local-avatar.jpg',
            'avatar_url' => 'https://example.com/google-avatar.png',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.avatar', Storage::disk('public')->url('avatars/users/local-avatar.jpg'))
            );
    }

    public function test_google_avatar_is_used_when_no_uploaded_avatar_exists(): void
    {
        $user = User::factory()->create([
            'avatar_path' => null,
            'avatar_url' => 'https://example.com/google-avatar.png',
        ]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.avatar', 'https://example.com/google-avatar.png')
            );
    }

    public function test_removing_uploaded_avatar_falls_back_to_google_avatar(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/users/local-avatar.jpg', 'avatar');
        $user = User::factory()->create([
            'avatar_path' => 'avatars/users/local-avatar.jpg',
            'avatar_url' => 'https://example.com/google-avatar.png',
        ]);

        $this->actingAs($user)
            ->delete(route('profile.preferences.avatar.destroy'))
            ->assertRedirect();

        $this->assertNull($user->fresh()->avatar_path);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('auth.user.avatar', 'https://example.com/google-avatar.png')
            );
    }

    public function test_removing_uploaded_avatar_does_not_delete_google_avatar_url(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('avatars/users/local-avatar.jpg', 'avatar');
        $user = User::factory()->create([
            'avatar_path' => 'avatars/users/local-avatar.jpg',
            'avatar_url' => 'https://example.com/google-avatar.png',
        ]);

        $this->actingAs($user)
            ->delete(route('profile.preferences.avatar.destroy'))
            ->assertRedirect();

        $user->refresh();

        $this->assertNull($user->avatar_path);
        $this->assertSame('https://example.com/google-avatar.png', $user->avatar_url);
        $this->assertSame('https://example.com/google-avatar.png', $user->avatar);
    }
}

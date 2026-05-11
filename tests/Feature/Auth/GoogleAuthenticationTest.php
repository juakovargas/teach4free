<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_redirect_route_exists(): void
    {
        $this->assertTrue(route('auth.google.redirect') !== '');
        $this->assertTrue(route('auth.google.callback') !== '');
    }

    public function test_google_login_does_not_crash_when_credentials_are_missing(): void
    {
        config([
            'services.google.client_id' => null,
            'services.google.client_secret' => null,
            'services.google.redirect' => null,
        ]);

        $this->get(route('auth.google.redirect'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('google');
    }

    public function test_google_callback_links_existing_user_when_socialite_is_mocked(): void
    {
        config([
            'services.google.client_id' => 'fake-client-id',
            'services.google.client_secret' => 'fake-client-secret',
            'services.google.redirect' => 'http://127.0.0.1:8000/auth/google/callback',
        ]);

        $user = User::factory()->create([
            'email' => 'learner@example.com',
            'google_id' => null,
            'email_verified_at' => null,
        ]);

        Socialite::fake('google', (new SocialiteUser)->map([
            'id' => 'google-existing-123',
            'name' => 'Google Learner',
            'email' => 'learner@example.com',
            'avatar' => 'https://example.com/avatar.png',
        ]));

        $this->get(route('auth.google.callback'))
            ->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user->fresh());
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'google_id' => 'google-existing-123',
            'avatar_url' => 'https://example.com/avatar.png',
        ]);
        $this->assertNotNull($user->fresh()->email_verified_at);
    }
}

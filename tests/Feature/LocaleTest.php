<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_switch_locale(): void
    {
        $response = $this->from(route('home'))->post(route('locale.update'), [
            'locale' => 'es',
        ]);

        $response->assertRedirect(route('home'));
        $response->assertSessionHas('locale', 'es');
    }

    public function test_authenticated_user_locale_is_persisted(): void
    {
        $user = User::factory()->create([
            'preferred_locale' => 'en',
        ]);

        $response = $this->actingAs($user)
            ->from(route('dashboard'))
            ->post(route('locale.update'), [
                'locale' => 'fr',
            ]);

        $response->assertRedirect(route('dashboard'));
        $response->assertSessionHas('locale', 'fr');
        $this->assertSame('fr', $user->fresh()->preferred_locale);
    }
}

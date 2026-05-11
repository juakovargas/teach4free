<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->googleIsConfigured()) {
            return redirect()->route('login')->withErrors([
                'google' => __('ui.google.not_configured'),
            ]);
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! $this->googleIsConfigured()) {
            return redirect()->route('login')->withErrors([
                'google' => __('ui.google.not_configured'),
            ]);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()->route('login')->withErrors([
                'google' => __('ui.google.failed'),
            ]);
        }

        if (! $googleUser->getEmail()) {
            return redirect()->route('login')->withErrors([
                'google' => __('ui.google.missing_email'),
            ]);
        }

        $user = User::query()
            ->where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if ($user) {
            $user->forceFill([
                'google_id' => $googleUser->getId(),
                'avatar_url' => $googleUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
            ])->save();
        } else {
            $user = User::create([
                'name' => $googleUser->getName() ?: $googleUser->getEmail(),
                'email' => $googleUser->getEmail(),
                'password' => Str::random(40),
                'preferred_locale' => session('locale', config('app.locale')),
                'timezone' => 'Europe/Madrid',
                'role' => User::ROLE_USER,
                'google_id' => $googleUser->getId(),
                'avatar_url' => $googleUser->getAvatar(),
                'email_verified_at' => now(),
            ]);
        }

        if ($user->isRestricted()) {
            Auth::guard('web')->logout();

            return redirect()->route('login')->with('status', __('ui.auth.account_restricted'));
        }

        Auth::login($user);

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ])->save();

        return redirect()->route($user->isAdmin() ? 'admin.dashboard' : 'dashboard');
    }

    private function googleIsConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }
}

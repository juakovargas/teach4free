<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CookieSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CookieSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/cookie-settings', [
            'settings' => CookieSetting::current()->load('updater:id,name,email'),
            'options' => [
                'region_modes' => CookieSetting::regionModes(),
                'durations' => CookieSetting::allowedDurations(),
                'banner_styles' => CookieSetting::bannerStyles(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'banner_enabled' => ['required', 'boolean'],
            'consent_required_regions' => ['required', 'string', Rule::in(CookieSetting::regionModes())],
            'custom_required_country_codes' => ['nullable', 'string', 'max:1000'],
            'consent_duration_days' => ['required', 'integer', Rule::in(CookieSetting::allowedDurations())],
            'consent_version' => ['required', 'string', 'max:32', 'regex:/^[A-Za-z0-9._-]+$/'],
            'show_reject_button' => ['required', 'boolean'],
            'show_configure_button' => ['required', 'boolean'],
            'block_analytics_until_consent' => ['required', 'boolean'],
            'block_marketing_until_consent' => ['required', 'boolean'],
            'block_external_content_until_consent' => ['required', 'boolean'],
            'banner_style' => ['required', 'string', Rule::in(CookieSetting::bannerStyles())],
        ]);

        $data['custom_required_country_codes'] = $this->normalizeCountryCodes($data['custom_required_country_codes'] ?? null);

        CookieSetting::current()->forceFill([
            ...$data,
            'updated_by' => $request->user()->id,
        ])->save();

        return back()->with('status', __('ui.admin_cookie_settings.saved'));
    }

    private function normalizeCountryCodes(?string $countryCodes): ?string
    {
        if (! $countryCodes) {
            return null;
        }

        $codes = collect(preg_split('/[\s,;]+/', $countryCodes) ?: [])
            ->map(fn (string $code): string => strtoupper(trim($code)))
            ->filter(fn (string $code): bool => preg_match('/^[A-Z]{2}$/', $code) === 1)
            ->unique()
            ->values();

        return $codes->isEmpty() ? null : $codes->implode(', ');
    }
}

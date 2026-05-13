<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformTrackingSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/analytics', [
            'settings' => PlatformTrackingSetting::current()->load('updater:id,name,email'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'google_analytics_id' => ['nullable', 'string', 'max:80'],
            'google_tag_manager_id' => ['nullable', 'string', 'max:80'],
            'meta_pixel_id' => ['nullable', 'string', 'max:80'],
            'tiktok_pixel_id' => ['nullable', 'string', 'max:80'],
            'linkedin_partner_id' => ['nullable', 'string', 'max:80'],
            'microsoft_clarity_id' => ['nullable', 'string', 'max:80'],
            'plausible_domain' => ['nullable', 'string', 'max:255'],
            'custom_head_script' => ['nullable', 'string', 'max:20000'],
            'custom_body_script' => ['nullable', 'string', 'max:20000'],
            'tracking_enabled' => ['required', 'boolean'],
            'cookie_consent_required' => ['required', 'boolean'],
        ]);

        $settings = PlatformTrackingSetting::current();
        $settings->forceFill([
            ...$data,
            'updated_by' => $request->user()->id,
        ])->save();

        return back()->with('status', __('ui.admin_analytics.saved'));
    }
}

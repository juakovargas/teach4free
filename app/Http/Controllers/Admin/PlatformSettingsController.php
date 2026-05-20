<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlatformSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('admin/platform-settings', [
            'settings' => PlatformSetting::current()->load('updater:id,name,email'),
            'supportedLocales' => config('app.supported_locales', ['en', 'es', 'fr']),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $supportedLocales = config('app.supported_locales', ['en', 'es', 'fr']);
        $data = $request->validate([
            'platform_name' => ['required', 'string', 'max:120'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'default_locale' => ['required', 'string', Rule::in($supportedLocales)],
            'allow_teacher_category_proposals' => ['required', 'boolean'],
            'allow_teacher_subject_proposals' => ['required', 'boolean'],
            'require_email_verification' => ['required', 'boolean'],
            'allow_public_teacher_profiles' => ['required', 'boolean'],
            'allow_open_public_sessions' => ['required', 'boolean'],
            'maintenance_notice' => ['nullable', 'string', 'max:2000'],
            'seo_site_name' => ['nullable', 'string', 'max:120'],
            'seo_default_meta_title' => ['nullable', 'string', 'max:180'],
            'seo_default_meta_description' => ['nullable', 'string', 'max:500'],
            'seo_default_robots' => ['required', 'string', 'max:80'],
            'seo_default_og_image_path' => ['nullable', 'string', 'max:255'],
            'seo_enable_sitemap' => ['required', 'boolean'],
            'seo_enable_structured_data' => ['required', 'boolean'],
            'seo_search_indexing_enabled' => ['required', 'boolean'],
        ]);

        PlatformSetting::current()->forceFill([
            ...$data,
            'updated_by' => $request->user()->id,
        ])->save();

        return back()->with('status', __('ui.admin_platform_settings.saved'));
    }
}

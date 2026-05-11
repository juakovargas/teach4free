<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\UserLanguage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfilePreferencesController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('userLanguages.language');

        return Inertia::render('profile/preferences', [
            'profile' => [
                'name' => $user->name,
                'preferred_locale' => $user->preferred_locale,
                'timezone' => $user->timezone ?? 'Europe/Madrid',
                'bio' => $user->bio,
                'is_public' => $user->is_public,
                'learning_interests' => $user->learning_interests,
                'teaching_interests' => $user->teaching_interests,
                'avatar' => $user->avatar,
                'has_local_avatar' => $user->avatar_path !== null,
            ],
            'languages' => Language::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'native_name']),
            'userLanguages' => $user->userLanguages
                ->mapWithKeys(fn (UserLanguage $language): array => [
                    $language->language_id => [
                        'understands' => $language->understands,
                        'speaks' => $language->speaks,
                        'teaches' => $language->teaches,
                        'level' => $language->level,
                    ],
                ]),
            'languageLevels' => UserLanguage::LEVELS,
            'timezones' => $this->timezones(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'preferred_locale' => ['required', 'string', Rule::in(array_keys(config('app.supported_locales')))],
            'timezone' => ['required', 'string', 'timezone'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'is_public' => ['required', 'boolean'],
            'learning_interests' => ['nullable', 'string', 'max:2000'],
            'teaching_interests' => ['nullable', 'string', 'max:2000'],
            'languages' => ['array'],
            'languages.*.language_id' => ['required', 'integer', Rule::exists('languages', 'id')->where('is_active', true)],
            'languages.*.understands' => ['required', 'boolean'],
            'languages.*.speaks' => ['required', 'boolean'],
            'languages.*.teaches' => ['required', 'boolean'],
            'languages.*.level' => ['nullable', 'string', Rule::in(UserLanguage::LEVELS)],
        ]);

        $user = $request->user();
        $user->forceFill([
            'name' => $validated['name'],
            'preferred_locale' => $validated['preferred_locale'],
            'timezone' => $validated['timezone'],
            'bio' => $validated['bio'] ?? null,
            'is_public' => $validated['is_public'],
            'learning_interests' => $validated['learning_interests'] ?? null,
            'teaching_interests' => $validated['teaching_interests'] ?? null,
        ])->save();

        $request->session()->put('locale', $validated['preferred_locale']);

        $submittedLanguageIds = [];

        foreach ($validated['languages'] ?? [] as $languageData) {
            $languageData['speaks'] = $languageData['speaks'] || $languageData['teaches'];
            $hasAnyPreference = $languageData['understands'] || $languageData['speaks'] || $languageData['teaches'];
            $submittedLanguageIds[] = $languageData['language_id'];

            if (! $hasAnyPreference) {
                UserLanguage::query()
                    ->where('user_id', $user->id)
                    ->where('language_id', $languageData['language_id'])
                    ->delete();

                continue;
            }

            UserLanguage::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'language_id' => $languageData['language_id'],
                ],
                [
                    'understands' => $languageData['understands'],
                    'speaks' => $languageData['speaks'],
                    'teaches' => $languageData['teaches'],
                    'level' => $languageData['level'] ?? null,
                ],
            );
        }

        if ($submittedLanguageIds !== []) {
            UserLanguage::query()
                ->where('user_id', $user->id)
                ->whereNotIn('language_id', $submittedLanguageIds)
                ->delete();
        }

        return back()->with('status', __('ui.profile_preferences.saved'));
    }

    public function updateAvatar(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $validated['avatar']->store('avatars', 'public');

        $user->forceFill(['avatar_path' => $path])->save();

        return back()->with('status', __('ui.profile_preferences.avatar_saved'));
    }

    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->forceFill(['avatar_path' => null])->save();

        return back()->with('status', __('ui.profile_preferences.avatar_removed'));
    }

    /**
     * @return array<int, string>
     */
    private function timezones(): array
    {
        return [
            'Europe/Madrid',
            'UTC',
            'Europe/London',
            'Europe/Paris',
            'America/New_York',
            'America/Mexico_City',
            'America/Bogota',
            'America/Argentina/Buenos_Aires',
            'Asia/Tokyo',
            'Australia/Sydney',
        ];
    }
}

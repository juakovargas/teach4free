<?php

namespace App\Http\Controllers;

use App\Models\UserNotificationPreference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationPreferenceController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('profile/notification-preferences', [
            'preferences' => $request->user()->notificationPreference()->firstOrCreate([]),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate(
            collect(UserNotificationPreference::EMAIL_FIELDS)
                ->mapWithKeys(fn (string $field): array => [$field => ['required', 'boolean']])
                ->all()
        );

        $request->user()->notificationPreference()->updateOrCreate([], $data);

        return back()->with('status', __('ui.notification_preferences.updated'));
    }
}

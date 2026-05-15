<?php

namespace App\Http\Controllers;

use App\Models\TeacherProfile;
use App\Services\BadgeAwardingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $profile = $this->profileFor($request);

        return Inertia::render('profile/teacher', [
            'profile' => [
                'headline' => $profile->headline,
                'teaching_bio' => $profile->teaching_bio,
                'experience_summary' => $profile->experience_summary,
                'public_intro' => $profile->public_intro,
                'preferred_teaching_mode' => $profile->preferred_teaching_mode,
                'max_students_per_session' => $profile->max_students_per_session,
                'default_session_duration_minutes' => $profile->default_session_duration_minutes,
                'meeting_tool' => $profile->meeting_tool,
                'meeting_url' => $profile->meeting_url,
                'banner' => $profile->banner,
                'has_banner' => $profile->banner_path !== null,
                'profile_accent_color' => $profile->profile_accent_color,
                'show_badges' => $profile->show_badges,
                'show_reviews' => $profile->show_reviews,
                'show_reputation_summary' => $profile->show_reputation_summary,
                'show_completed_sessions_count' => $profile->show_completed_sessions_count,
                'show_students_helped_count' => $profile->show_students_helped_count,
                'show_teaching_hours' => $profile->show_teaching_hours,
                'show_location' => $profile->show_location,
                'show_availability_summary' => $profile->show_availability_summary,
                'is_active' => $profile->is_active,
                'is_accepting_requests' => $profile->is_accepting_requests,
                'is_verified' => $profile->is_verified,
                'activated_at' => $profile->activated_at?->toISOString(),
                'paused_at' => $profile->paused_at?->toISOString(),
                'public_profile_url' => $profile->is_active ? route('teachers.show', $request->user()) : null,
            ],
            'modes' => TeacherProfile::MODES,
            'meetingTools' => TeacherProfile::MEETING_TOOLS,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'headline' => ['nullable', 'string', 'max:255'],
            'public_intro' => ['nullable', 'string', 'max:800'],
            'teaching_bio' => ['nullable', 'string', 'max:4000'],
            'experience_summary' => ['nullable', 'string', 'max:4000'],
            'profile_accent_color' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'preferred_teaching_mode' => ['required', 'string', Rule::in(TeacherProfile::MODES)],
            'max_students_per_session' => ['required', 'integer', 'min:1', 'max:100'],
            'default_session_duration_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'meeting_tool' => ['required', 'string', Rule::in(TeacherProfile::MEETING_TOOLS)],
            'meeting_url' => [
                Rule::requiredIf($request->input('meeting_tool') === TeacherProfile::TOOL_CUSTOM),
                'nullable',
                'url',
                'max:2048',
            ],
            'is_accepting_requests' => ['required', 'boolean'],
            'show_badges' => ['required', 'boolean'],
            'show_reviews' => ['required', 'boolean'],
            'show_reputation_summary' => ['required', 'boolean'],
            'show_completed_sessions_count' => ['required', 'boolean'],
            'show_students_helped_count' => ['required', 'boolean'],
            'show_teaching_hours' => ['required', 'boolean'],
            'show_location' => ['required', 'boolean'],
            'show_availability_summary' => ['required', 'boolean'],
        ]);

        $profile = $this->profileFor($request);
        $validated['is_accepting_requests'] = $profile->is_active && $validated['is_accepting_requests'];

        $profile->update($validated);

        return back()->with('status', __('ui.teacher_profile.saved'));
    }

    public function updateBanner(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'banner' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $profile = $this->profileFor($request);

        if ($profile->banner_path) {
            Storage::disk('public')->delete($profile->banner_path);
        }

        $path = $validated['banner']->store('banners/teachers', 'public');

        $profile->forceFill(['banner_path' => $path])->save();

        return back()->with('status', __('ui.teacher_profile.banner_updated'));
    }

    public function destroyBanner(Request $request): RedirectResponse
    {
        $profile = $this->profileFor($request);

        if ($profile->banner_path) {
            Storage::disk('public')->delete($profile->banner_path);
            $profile->forceFill(['banner_path' => null])->save();
        }

        return back()->with('status', __('ui.teacher_profile.banner_removed'));
    }

    public function activate(Request $request, BadgeAwardingService $badges): RedirectResponse
    {
        $profile = $this->profileFor($request);

        $profile->forceFill([
            'is_active' => true,
            'is_accepting_requests' => true,
            'activated_at' => $profile->activated_at ?? now(),
            'paused_at' => null,
        ])->save();
        $badges->awardForTeacher($request->user());

        return back()->with('status', __('ui.teacher_profile.activated'));
    }

    public function pause(Request $request): RedirectResponse
    {
        $this->profileFor($request)->forceFill([
            'is_active' => false,
            'is_accepting_requests' => false,
            'paused_at' => now(),
        ])->save();

        return back()->with('status', __('ui.teacher_profile.paused'));
    }

    private function profileFor(Request $request): TeacherProfile
    {
        return TeacherProfile::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'preferred_teaching_mode' => TeacherProfile::MODE_ANY,
                'max_students_per_session' => 1,
                'default_session_duration_minutes' => 60,
                'meeting_tool' => TeacherProfile::TOOL_NOT_DECIDED,
                'is_active' => false,
                'is_accepting_requests' => false,
                'is_verified' => false,
                'show_badges' => true,
                'show_reviews' => true,
                'show_reputation_summary' => true,
                'show_completed_sessions_count' => true,
                'show_students_helped_count' => true,
                'show_teaching_hours' => true,
                'show_location' => true,
                'show_availability_summary' => true,
            ],
        );
    }
}

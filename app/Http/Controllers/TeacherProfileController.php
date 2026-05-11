<?php

namespace App\Http\Controllers;

use App\Models\TeacherProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'preferred_teaching_mode' => $profile->preferred_teaching_mode,
                'max_students_per_session' => $profile->max_students_per_session,
                'default_session_duration_minutes' => $profile->default_session_duration_minutes,
                'meeting_tool' => $profile->meeting_tool,
                'meeting_url' => $profile->meeting_url,
                'is_active' => $profile->is_active,
                'is_accepting_requests' => $profile->is_accepting_requests,
                'is_verified' => $profile->is_verified,
                'activated_at' => $profile->activated_at?->toISOString(),
                'paused_at' => $profile->paused_at?->toISOString(),
            ],
            'modes' => TeacherProfile::MODES,
            'meetingTools' => TeacherProfile::MEETING_TOOLS,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'headline' => ['nullable', 'string', 'max:255'],
            'teaching_bio' => ['nullable', 'string', 'max:4000'],
            'experience_summary' => ['nullable', 'string', 'max:4000'],
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
        ]);

        $profile = $this->profileFor($request);
        $validated['is_accepting_requests'] = $profile->is_active && $validated['is_accepting_requests'];

        $profile->update($validated);

        return back()->with('status', __('ui.teacher_profile.saved'));
    }

    public function activate(Request $request): RedirectResponse
    {
        $profile = $this->profileFor($request);

        $profile->forceFill([
            'is_active' => true,
            'is_accepting_requests' => true,
            'activated_at' => $profile->activated_at ?? now(),
            'paused_at' => null,
        ])->save();

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
            ],
        );
    }
}

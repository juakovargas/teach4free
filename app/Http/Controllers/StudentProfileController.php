<?php

namespace App\Http\Controllers;

use App\Models\StudentProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $profile = $this->profileFor($request);

        return Inertia::render('profile/student', [
            'profile' => [
                'learning_goals' => $profile->learning_goals,
                'current_level' => $profile->current_level,
                'preferred_learning_mode' => $profile->preferred_learning_mode,
                'availability_notes' => $profile->availability_notes,
                'is_active' => $profile->is_active,
            ],
            'levels' => StudentProfile::LEVELS,
            'modes' => StudentProfile::MODES,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'learning_goals' => ['nullable', 'string', 'max:4000'],
            'current_level' => ['required', 'string', Rule::in(StudentProfile::LEVELS)],
            'preferred_learning_mode' => ['required', 'string', Rule::in(StudentProfile::MODES)],
            'availability_notes' => ['nullable', 'string', 'max:4000'],
            'is_active' => ['required', 'boolean'],
        ]);

        $this->profileFor($request)->update($validated);

        return back()->with('status', __('ui.student_profile.saved'));
    }

    private function profileFor(Request $request): StudentProfile
    {
        return StudentProfile::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'current_level' => StudentProfile::LEVEL_MIXED,
                'preferred_learning_mode' => StudentProfile::MODE_ANY,
                'is_active' => true,
            ],
        );
    }
}

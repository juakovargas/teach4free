<?php

namespace App\Http\Controllers;

use App\Models\TeacherAvailability;
use App\Models\TeacherAvailabilityException;
use App\Models\TeacherProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class TeacherAvailabilityController extends Controller
{
    public function index(Request $request): Response
    {
        $teacherProfile = $request->user()->teacherProfile;

        return Inertia::render('teacher/availability', [
            'canManage' => (bool) $teacherProfile?->is_active,
            'teacherProfile' => $teacherProfile,
            'availabilities' => $request->user()->teacherAvailabilities()
                ->orderBy('day_of_week')
                ->orderBy('starts_at')
                ->get(),
            'exceptions' => $request->user()->teacherAvailabilityExceptions()
                ->orderBy('date')
                ->orderBy('starts_at')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $teacherProfile = $this->activeTeacherProfile($request);
        $data = $this->availabilityData($request);
        $this->ensureNoOverlap($request, $data);

        $request->user()->teacherAvailabilities()->create([
            ...$data,
            'teacher_profile_id' => $teacherProfile->id,
        ]);

        return back()->with('status', __('ui.teacher_availability.created'));
    }

    public function update(Request $request, TeacherAvailability $availability): RedirectResponse
    {
        abort_unless($availability->user_id === $request->user()->id, 403);

        $this->activeTeacherProfile($request);
        $data = $this->availabilityData($request);
        $this->ensureNoOverlap($request, $data, $availability);

        $availability->update($data);

        return back()->with('status', __('ui.teacher_availability.updated'));
    }

    public function destroy(Request $request, TeacherAvailability $availability): RedirectResponse
    {
        abort_unless($availability->user_id === $request->user()->id, 403);

        $availability->delete();

        return back()->with('status', __('ui.teacher_availability.deleted'));
    }

    public function storeException(Request $request): RedirectResponse
    {
        $teacherProfile = $this->activeTeacherProfile($request);
        $data = $this->exceptionData($request);

        $request->user()->teacherAvailabilityExceptions()->create([
            ...$data,
            'teacher_profile_id' => $teacherProfile->id,
        ]);

        return back()->with('status', __('ui.teacher_availability.exception_created'));
    }

    public function updateException(Request $request, TeacherAvailabilityException $exception): RedirectResponse
    {
        abort_unless($exception->user_id === $request->user()->id, 403);

        $this->activeTeacherProfile($request);
        $exception->update($this->exceptionData($request));

        return back()->with('status', __('ui.teacher_availability.exception_updated'));
    }

    public function destroyException(Request $request, TeacherAvailabilityException $exception): RedirectResponse
    {
        abort_unless($exception->user_id === $request->user()->id, 403);

        $exception->delete();

        return back()->with('status', __('ui.teacher_availability.exception_deleted'));
    }

    private function activeTeacherProfile(Request $request): TeacherProfile
    {
        $teacherProfile = $request->user()->teacherProfile;

        abort_unless($teacherProfile?->is_active, 403, __('ui.teacher_availability.not_ready'));

        return $teacherProfile;
    }

    /**
     * @return array<string, mixed>
     */
    private function availabilityData(Request $request): array
    {
        return $request->validate([
            'day_of_week' => ['required', 'integer', 'between:1,7'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
            'timezone' => ['required', 'string', 'timezone'],
            'default_duration_minutes' => ['required', 'integer', 'between:15,240'],
            'default_capacity' => ['required', 'integer', 'between:1,500'],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function exceptionData(Request $request): array
    {
        $isFullDay = $request->boolean('is_full_day');

        $data = $request->validate([
            'date' => ['required', 'date'],
            'starts_at' => [Rule::requiredIf(! $isFullDay), 'nullable', 'date_format:H:i'],
            'ends_at' => [Rule::requiredIf(! $isFullDay), 'nullable', 'date_format:H:i', 'after:starts_at'],
            'type' => ['required', 'string', Rule::in(TeacherAvailabilityException::TYPES)],
            'reason' => ['nullable', 'string', 'max:1000'],
            'is_full_day' => ['required', 'boolean'],
        ]);

        if ($isFullDay) {
            $data['starts_at'] = null;
            $data['ends_at'] = null;
        }

        return $data;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function ensureNoOverlap(Request $request, array $data, ?TeacherAvailability $ignore = null): void
    {
        $overlap = $request->user()->teacherAvailabilities()
            ->where('day_of_week', $data['day_of_week'])
            ->where('starts_at', '<', $data['ends_at'])
            ->where('ends_at', '>', $data['starts_at'])
            ->when($ignore, fn ($query) => $query->whereKeyNot($ignore->id))
            ->exists();

        if ($overlap) {
            throw ValidationException::withMessages([
                'starts_at' => __('ui.teacher_availability.overlap_error'),
            ]);
        }
    }
}

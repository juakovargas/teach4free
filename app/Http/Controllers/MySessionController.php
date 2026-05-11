<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Notifications\ClassSessionNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MySessionController extends Controller
{
    public function index(Request $request): Response
    {
        $attendances = $request->user()->sessionAttendances()
            ->with([
                'session.offer:id,title,slug',
                'session.teacher:id,name,email,avatar_path,avatar_url',
            ])
            ->whereHas('session')
            ->latest()
            ->get();

        return Inertia::render('my-sessions/index', [
            'sessions' => $attendances->map(fn (ClassSessionAttendee $attendance): array => [
                'attendance_id' => $attendance->id,
                'attendance_status' => $attendance->status,
                'can_cancel' => $attendance->status === ClassSessionAttendee::STATUS_ENROLLED
                    && $attendance->session->status === ClassSession::STATUS_SCHEDULED
                    && $attendance->session->starts_at?->isFuture(),
                'session' => [
                    ...$attendance->session->only([
                        'id',
                        'title',
                        'starts_at',
                        'ends_at',
                        'timezone',
                        'status',
                        'meeting_tool',
                        'meeting_url',
                    ]),
                    'offer' => $attendance->session->offer,
                    'teacher' => $attendance->session->teacher,
                ],
            ]),
        ]);
    }

    public function cancel(Request $request, ClassSession $session): RedirectResponse
    {
        $attendance = $session->attendees()
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        abort_unless($session->status === ClassSession::STATUS_SCHEDULED && $attendance->status === ClassSessionAttendee::STATUS_ENROLLED, 403);

        $attendance->forceFill([
            'status' => ClassSessionAttendee::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ])->save();

        $session->teacher->notify(new ClassSessionNotification(
            $session,
            ClassSessionNotification::EVENT_STUDENT_CANCELLED,
        ));

        return back()->with('status', __('ui.sessions.participation_cancelled'));
    }
}

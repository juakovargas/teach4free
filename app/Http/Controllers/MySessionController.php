<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Notifications\ClassSessionNotification;
use App\Services\ConversationService;
use App\Services\ReviewEligibilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MySessionController extends Controller
{
    public function index(Request $request, ReviewEligibilityService $reviewEligibility): Response
    {
        $attendances = $request->user()->sessionAttendances()
            ->with([
                'session.offer:id,title,slug',
                'session.teacher:id,name,email,avatar_path,avatar_url',
                'session.conversation:id,class_session_id',
                'session.attendees',
                'session.application',
            ])
            ->whereHas('session')
            ->latest()
            ->get();

        return Inertia::render('my-sessions/index', [
            'sessions' => $attendances->map(function (ClassSessionAttendee $attendance) use ($request, $reviewEligibility): array {
                $existingReview = $reviewEligibility->existingReview($request->user(), $attendance->session);

                return [
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
                        'conversation_id' => $attendance->session->conversation?->id,
                    ],
                    'review' => [
                        'can_review' => $reviewEligibility->canReview($request->user(), $attendance->session),
                        'submitted' => $existingReview !== null,
                        'id' => $existingReview?->id,
                        'status' => $existingReview?->status,
                        'rating' => $existingReview?->rating,
                    ],
                ];
            }),
        ]);
    }

    public function cancel(Request $request, ClassSession $session, ConversationService $conversations): RedirectResponse
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

        $conversation = $conversations->ensureSessionConversation($session);
        $conversations->addSystemMessage($conversation, __('ui.messages.system.session_student_cancelled', [
            'student' => $request->user()->name,
            'session' => $session->title,
        ]));

        return back()->with('status', __('ui.sessions.participation_cancelled'));
    }
}

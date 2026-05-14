<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Notifications\ClassSessionNotification;
use App\Services\ConversationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherSessionController extends Controller
{
    public function index(Request $request): Response
    {
        $sessions = ClassSession::query()
            ->where('teacher_user_id', $request->user()->id)
            ->with(['offer:id,title,slug', 'conversation:id,class_session_id', 'attendees.user:id,name,email,avatar_path,avatar_url'])
            ->withCount(['attendees as enrolled_attendees_count' => fn ($query) => $query->where('status', ClassSessionAttendee::STATUS_ENROLLED)])
            ->orderBy('starts_at')
            ->get();

        return Inertia::render('teacher/sessions/index', [
            'sessions' => $sessions,
        ]);
    }

    public function complete(Request $request, ClassSession $session, ConversationService $conversations): RedirectResponse
    {
        $this->authorizeSession($request, $session);

        $session->forceFill([
            'status' => ClassSession::STATUS_COMPLETED,
            'completed_at' => now(),
        ])->save();

        $session->attendees()
            ->where('status', ClassSessionAttendee::STATUS_ENROLLED)
            ->update([
                'status' => ClassSessionAttendee::STATUS_ATTENDED,
                'updated_at' => now(),
            ]);

        $this->notifyAttendees($session, ClassSessionNotification::EVENT_SESSION_COMPLETED);
        $conversation = $conversations->ensureSessionConversation($session);
        $conversations->addSystemMessage($conversation, __('ui.messages.system.session_no_show', [
            'session' => $session->title,
        ]));

        return back()->with('status', __('ui.sessions.completed'));
    }

    public function cancel(Request $request, ClassSession $session, ConversationService $conversations): RedirectResponse
    {
        $this->authorizeSession($request, $session);

        $data = $request->validate([
            'cancellation_reason' => ['required', 'string', 'max:2000'],
        ]);

        $session->forceFill([
            'status' => ClassSession::STATUS_CANCELLED,
            'cancellation_reason' => $data['cancellation_reason'],
            'cancelled_at' => now(),
        ])->save();

        $session->attendees()
            ->where('status', ClassSessionAttendee::STATUS_ENROLLED)
            ->update([
                'status' => ClassSessionAttendee::STATUS_CANCELLED,
                'cancelled_at' => now(),
                'updated_at' => now(),
            ]);

        $this->notifyAttendees($session, ClassSessionNotification::EVENT_SESSION_CANCELLED);
        $conversation = $conversations->ensureSessionConversation($session);
        $conversations->addSystemMessage($conversation, __('ui.messages.system.session_cancelled', [
            'session' => $session->title,
        ]));

        return back()->with('status', __('ui.sessions.cancelled'));
    }

    public function noShow(Request $request, ClassSession $session, ConversationService $conversations): RedirectResponse
    {
        $this->authorizeSession($request, $session);

        $session->forceFill([
            'status' => ClassSession::STATUS_NO_SHOW,
            'no_show_marked_at' => now(),
        ])->save();

        $session->attendees()
            ->where('status', ClassSessionAttendee::STATUS_ENROLLED)
            ->update([
                'status' => ClassSessionAttendee::STATUS_NO_SHOW,
                'no_show_at' => now(),
                'updated_at' => now(),
            ]);

        $this->notifyAttendees($session, ClassSessionNotification::EVENT_SESSION_NO_SHOW);
        $conversation = $conversations->ensureSessionConversation($session);
        $conversations->addSystemMessage($conversation, __('ui.messages.system.session_completed', [
            'session' => $session->title,
        ]));

        return back()->with('status', __('ui.sessions.no_show_marked'));
    }

    private function authorizeSession(Request $request, ClassSession $session): void
    {
        abort_unless($session->teacher_user_id === $request->user()->id, 403);
    }

    private function notifyAttendees(ClassSession $session, string $event): void
    {
        $session->loadMissing('attendees.user');

        foreach ($session->attendees as $attendance) {
            $attendance->user?->notify(new ClassSessionNotification($session, $event));
        }
    }
}

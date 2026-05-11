<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Notifications\ClassSessionNotification;
use App\Services\TeachingOfferApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StudentApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        $applications = TeachingOfferApplication::query()
            ->where('student_user_id', $request->user()->id)
            ->with([
                'preferredLanguage:id,code,name,native_name',
                'offer:id,user_id,teaching_category_id,teaching_subject_id,title,slug,session_type,meeting_tool,meeting_url,duration_minutes,timezone',
                'offer.user:id,name,email,avatar_path,avatar_url',
                'offer.category:id,name,slug,color',
                'offer.subject:id,name,slug',
                'offer.languages:id,code,name,native_name',
            ])
            ->latest('requested_at')
            ->get()
            ->map(fn (TeachingOfferApplication $application): array => [
                'id' => $application->id,
                'status' => $application->status,
                'message' => $application->message,
                'availability_note' => $application->availability_note,
                'preferred_starts_at' => $application->preferred_starts_at,
                'preferred_timezone' => $application->preferred_timezone,
                'teacher_response' => $application->teacher_response,
                'requested_at' => $application->requested_at,
                'accepted_at' => $application->accepted_at,
                'rejected_at' => $application->rejected_at,
                'cancelled_at' => $application->cancelled_at,
                'preferred_language' => $application->preferredLanguage,
                'can_cancel' => $application->isCancellable(),
                'offer' => [
                    'title' => $application->offer->title,
                    'slug' => $application->offer->slug,
                    'session_type' => $application->offer->session_type,
                    'meeting_tool' => $application->offer->meeting_tool,
                    'meeting_url' => $this->visibleMeetingUrl($application),
                    'duration_minutes' => $application->offer->duration_minutes,
                    'timezone' => $application->offer->timezone,
                    'teacher' => $application->offer->user,
                    'category' => $application->offer->category,
                    'subject' => $application->offer->subject,
                    'languages' => $application->offer->languages,
                ],
            ]);

        return Inertia::render('my-applications/index', [
            'applications' => $applications,
        ]);
    }

    public function store(Request $request, TeachingOffer $offer, TeachingOfferApplicationService $service): RedirectResponse
    {
        abort_unless($offer->is_public && $offer->is_active && $offer->published_at !== null, 404);

        $languageIds = $offer->languages()->pluck('languages.id')->all();

        $data = $request->validate([
            'message' => ['nullable', 'string', 'max:2000'],
            'availability_note' => ['nullable', 'string', 'max:2000'],
            'preferred_language_id' => ['nullable', 'integer', Rule::in($languageIds)],
            'preferred_starts_at' => ['nullable', 'date', 'after:now'],
            'preferred_timezone' => ['nullable', 'string', 'timezone'],
            'class_session_id' => ['nullable', 'integer', 'exists:class_sessions,id'],
        ]);

        $data['preferred_timezone'] ??= $request->user()->timezone ?? 'Europe/Madrid';

        if (count($languageIds) > 1 && empty($data['preferred_language_id'])) {
            return back()->withErrors([
                'preferred_language_id' => __('ui.applications.preferred_language_required'),
            ])->withInput();
        }

        $session = $this->requestedSession($request, $offer, $data['class_session_id'] ?? null);

        $application = $service->apply($offer, $request->user(), $data);

        if ($session && $application->status === TeachingOfferApplication::STATUS_ACCEPTED) {
            $this->enrollInSession($session, $application, $request);
        }

        return redirect()
            ->route('my-applications.index')
            ->with('status', __('ui.applications.created_'.$application->status));
    }

    public function cancel(
        Request $request,
        TeachingOfferApplication $application,
        TeachingOfferApplicationService $service,
    ): RedirectResponse {
        abort_unless($application->student_user_id === $request->user()->id, 403);

        $service->cancelByStudent($application);

        return back()->with('status', __('ui.applications.cancelled'));
    }

    private function visibleMeetingUrl(TeachingOfferApplication $application): ?string
    {
        if (! $application->offer->meeting_url) {
            return null;
        }

        if ($application->status !== TeachingOfferApplication::STATUS_ACCEPTED) {
            return null;
        }

        return $application->offer->meeting_url;
    }

    private function requestedSession(Request $request, TeachingOffer $offer, ?int $sessionId): ?ClassSession
    {
        $hasScheduledSessions = $offer->sessions()
            ->where('status', ClassSession::STATUS_SCHEDULED)
            ->where('starts_at', '>=', now())
            ->exists();

        if ($offer->session_type === TeachingOffer::SESSION_OPEN_PUBLIC && $hasScheduledSessions && ! $sessionId) {
            throw ValidationException::withMessages([
                'class_session_id' => __('ui.applications.session_required'),
            ]);
        }

        if (! $sessionId) {
            return null;
        }

        $session = ClassSession::query()
            ->whereKey($sessionId)
            ->where('teaching_offer_id', $offer->id)
            ->where('status', ClassSession::STATUS_SCHEDULED)
            ->where('starts_at', '>=', now())
            ->first();

        if (! $session) {
            throw ValidationException::withMessages([
                'class_session_id' => __('ui.applications.session_not_available_error'),
            ]);
        }

        if ($session->attendees()->where('user_id', $request->user()->id)->exists()) {
            throw ValidationException::withMessages([
                'class_session_id' => __('ui.applications.already_enrolled_session'),
            ]);
        }

        if ($session->attendees()->where('status', ClassSessionAttendee::STATUS_ENROLLED)->count() >= $session->capacity) {
            throw ValidationException::withMessages([
                'class_session_id' => __('ui.applications.session_full_error'),
            ]);
        }

        return $session;
    }

    private function enrollInSession(ClassSession $session, TeachingOfferApplication $application, Request $request): void
    {
        $enrolledCount = $session->attendees()
            ->where('status', ClassSessionAttendee::STATUS_ENROLLED)
            ->count();

        if ($enrolledCount >= $session->capacity) {
            throw ValidationException::withMessages([
                'class_session_id' => __('ui.applications.session_full_error'),
            ]);
        }

        if ($session->attendees()->where('user_id', $request->user()->id)->exists()) {
            throw ValidationException::withMessages([
                'class_session_id' => __('ui.applications.already_enrolled_session'),
            ]);
        }

        ClassSessionAttendee::create([
            'class_session_id' => $session->id,
            'user_id' => $request->user()->id,
            'application_id' => $application->id,
            'status' => ClassSessionAttendee::STATUS_ENROLLED,
            'joined_at' => now(),
        ]);

        $request->user()->notify(new ClassSessionNotification(
            $session,
            ClassSessionNotification::EVENT_STUDENT_ADDED,
        ));
    }
}

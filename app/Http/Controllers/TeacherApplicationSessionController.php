<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\TeacherAvailabilityException;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Notifications\ClassSessionNotification;
use App\Services\ConversationService;
use App\Services\TeachingOfferApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class TeacherApplicationSessionController extends Controller
{
    public function store(
        Request $request,
        TeachingOfferApplication $application,
        TeachingOfferApplicationService $applicationService,
        ConversationService $conversations,
    ): RedirectResponse {
        abort_unless($application->teacher_user_id === $request->user()->id, 403);

        $application->loadMissing(['offer.teacherProfile', 'student', 'teacher']);
        $offer = $application->offer;

        $data = $request->validate([
            'starts_at' => ['required', 'date', 'after:now'],
            'duration_minutes' => ['required', 'integer', 'between:15,240'],
            'timezone' => ['required', 'string', 'timezone'],
            'capacity' => ['required', 'integer', 'between:1,500'],
            'meeting_tool' => ['required', 'string', Rule::in(TeachingOffer::MEETING_TOOLS)],
            'meeting_url' => ['nullable', 'url', 'max:255'],
            'teacher_response' => ['nullable', 'string', 'max:2000'],
        ]);

        $startsAt = Carbon::parse($data['starts_at'], $data['timezone']);
        $endsAt = (clone $startsAt)->addMinutes((int) $data['duration_minutes']);
        $withinAvailability = $this->isWithinAvailability($request, $startsAt, $endsAt);

        if ($application->status !== TeachingOfferApplication::STATUS_ACCEPTED) {
            $applicationService->accept($application, $data['teacher_response'] ?? null);
            $application->refresh();
        } elseif (($data['teacher_response'] ?? null) !== null) {
            $application->forceFill(['teacher_response' => $data['teacher_response']])->save();
        }

        $session = ClassSession::create([
            'teaching_offer_id' => $offer->id,
            'teacher_user_id' => $request->user()->id,
            'application_id' => $application->id,
            'title' => $offer->title,
            'description' => $data['teacher_response'] ?? null,
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'timezone' => $data['timezone'],
            'capacity' => $data['capacity'],
            'meeting_tool' => $data['meeting_tool'],
            'meeting_url' => $data['meeting_url'] ?? null,
            'status' => ClassSession::STATUS_SCHEDULED,
        ]);

        ClassSessionAttendee::firstOrCreate(
            [
                'class_session_id' => $session->id,
                'user_id' => $application->student_user_id,
            ],
            [
                'application_id' => $application->id,
                'status' => ClassSessionAttendee::STATUS_ENROLLED,
                'joined_at' => now(),
            ],
        );

        $application->student->notify(new ClassSessionNotification(
            $session,
            ClassSessionNotification::EVENT_SESSION_SCHEDULED,
        ));
        $request->user()->notify(new ClassSessionNotification(
            $session,
            ClassSessionNotification::EVENT_SESSION_SCHEDULED,
        ));

        $conversation = $conversations->ensureSessionConversation($session);
        $conversations->addSystemMessage($conversation, __('ui.messages.system.session_scheduled', [
            'session' => $session->title,
        ]));

        return back()->with('status', $withinAvailability
            ? __('ui.teacher_applications.session_scheduled')
            : __('ui.teacher_applications.session_scheduled_outside_availability'));
    }

    private function isWithinAvailability(Request $request, Carbon $startsAt, Carbon $endsAt): bool
    {
        $date = $startsAt->toDateString();
        $startsTime = $startsAt->format('H:i:s');
        $endsTime = $endsAt->format('H:i:s');

        $hasUnavailableException = $request->user()->teacherAvailabilityExceptions()
            ->where('date', $date)
            ->where('type', TeacherAvailabilityException::TYPE_UNAVAILABLE)
            ->where(function ($query) use ($startsTime, $endsTime): void {
                $query
                    ->where('is_full_day', true)
                    ->orWhere(function ($query) use ($startsTime, $endsTime): void {
                        $query
                            ->where('starts_at', '<', $endsTime)
                            ->where('ends_at', '>', $startsTime);
                    });
            })
            ->exists();

        if ($hasUnavailableException) {
            return false;
        }

        $hasExtraAvailability = $request->user()->teacherAvailabilityExceptions()
            ->where('date', $date)
            ->where('type', TeacherAvailabilityException::TYPE_EXTRA_AVAILABLE)
            ->where(function ($query) use ($startsTime, $endsTime): void {
                $query
                    ->where('is_full_day', true)
                    ->orWhere(function ($query) use ($startsTime, $endsTime): void {
                        $query
                            ->where('starts_at', '<=', $startsTime)
                            ->where('ends_at', '>=', $endsTime);
                    });
            })
            ->exists();

        if ($hasExtraAvailability) {
            return true;
        }

        return $request->user()->teacherAvailabilities()
            ->where('is_active', true)
            ->where('day_of_week', $startsAt->dayOfWeekIso)
            ->where('starts_at', '<=', $startsTime)
            ->where('ends_at', '>=', $endsTime)
            ->exists();
    }
}

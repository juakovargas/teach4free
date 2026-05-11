<?php

namespace App\Services;

use App\Models\StudentProfile;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\User;
use App\Notifications\TeachingOfferApplicationNotification;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class TeachingOfferApplicationService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function apply(TeachingOffer $offer, User $student, array $data): TeachingOfferApplication
    {
        if ($offer->user_id === $student->id) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.own_offer_error'),
            ]);
        }

        if (! $offer->is_accepting_applications) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.not_accepting_error'),
            ]);
        }

        if ($offer->applications()
            ->where('student_user_id', $student->id)
            ->whereIn('status', TeachingOfferApplication::ACTIVE_STATUSES)
            ->exists()
        ) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.duplicate_error'),
            ]);
        }

        $this->ensureLearningProfile($student);

        $status = $this->initialStatus($offer);
        $now = Carbon::now();

        $application = TeachingOfferApplication::create([
            'teaching_offer_id' => $offer->id,
            'student_user_id' => $student->id,
            'teacher_user_id' => $offer->user_id,
            'preferred_language_id' => $data['preferred_language_id'] ?? null,
            'preferred_starts_at' => $data['preferred_starts_at'] ?? null,
            'preferred_timezone' => $data['preferred_timezone'] ?? $student->timezone ?? 'Europe/Madrid',
            'status' => $status,
            'message' => $data['message'] ?? null,
            'availability_note' => $data['availability_note'] ?? null,
            'requested_at' => $now,
            'accepted_at' => $status === TeachingOfferApplication::STATUS_ACCEPTED ? $now : null,
        ]);

        if ($status === TeachingOfferApplication::STATUS_WAITLISTED) {
            $student->notify(new TeachingOfferApplicationNotification(
                $application,
                TeachingOfferApplicationNotification::EVENT_JOINED_WAITING_LIST,
            ));

            return $application;
        }

        if ($status === TeachingOfferApplication::STATUS_ACCEPTED) {
            $student->notify(new TeachingOfferApplicationNotification(
                $application,
                TeachingOfferApplicationNotification::EVENT_APPLICATION_ACCEPTED,
            ));

            return $application;
        }

        $offer->user->notify(new TeachingOfferApplicationNotification(
            $application,
            TeachingOfferApplicationNotification::EVENT_STUDENT_APPLIED,
        ));

        return $application;
    }

    public function accept(TeachingOfferApplication $application, ?string $response = null): TeachingOfferApplication
    {
        if (! in_array($application->status, [
            TeachingOfferApplication::STATUS_PENDING,
            TeachingOfferApplication::STATUS_WAITLISTED,
        ], true)) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.not_actionable_error'),
            ]);
        }

        $offer = $application->offer;

        if (! $offer->hasSeatAvailable()) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.capacity_full_error'),
            ]);
        }

        $application->forceFill([
            'status' => TeachingOfferApplication::STATUS_ACCEPTED,
            'teacher_response' => $response,
            'accepted_at' => now(),
            'rejected_at' => null,
            'cancelled_at' => null,
        ])->save();

        $application->student->notify(new TeachingOfferApplicationNotification(
            $application,
            TeachingOfferApplicationNotification::EVENT_APPLICATION_ACCEPTED,
        ));

        return $application;
    }

    public function reject(TeachingOfferApplication $application, ?string $response = null): TeachingOfferApplication
    {
        if (! in_array($application->status, [
            TeachingOfferApplication::STATUS_PENDING,
            TeachingOfferApplication::STATUS_WAITLISTED,
        ], true)) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.not_actionable_error'),
            ]);
        }

        $application->forceFill([
            'status' => TeachingOfferApplication::STATUS_REJECTED,
            'teacher_response' => $response,
            'rejected_at' => now(),
        ])->save();

        $application->student->notify(new TeachingOfferApplicationNotification(
            $application,
            TeachingOfferApplicationNotification::EVENT_APPLICATION_REJECTED,
        ));

        return $application;
    }

    public function cancelByStudent(TeachingOfferApplication $application): TeachingOfferApplication
    {
        if (! $application->isCancellable()) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.not_cancellable_error'),
            ]);
        }

        $wasAccepted = $application->status === TeachingOfferApplication::STATUS_ACCEPTED;

        $application->forceFill([
            'status' => TeachingOfferApplication::STATUS_CANCELLED,
            'cancelled_at' => now(),
        ])->save();

        $application->teacher->notify(new TeachingOfferApplicationNotification(
            $application,
            TeachingOfferApplicationNotification::EVENT_APPLICATION_CANCELLED,
        ));

        if ($wasAccepted) {
            $this->promoteNextWaitlisted($application->offer);
        }

        return $application;
    }

    public function cancelByTeacher(TeachingOfferApplication $application, ?string $response = null): TeachingOfferApplication
    {
        if (! $application->isCancellable()) {
            throw ValidationException::withMessages([
                'application' => __('ui.applications.not_cancellable_error'),
            ]);
        }

        $wasAccepted = $application->status === TeachingOfferApplication::STATUS_ACCEPTED;

        $application->forceFill([
            'status' => TeachingOfferApplication::STATUS_CANCELLED,
            'teacher_response' => $response,
            'cancelled_at' => now(),
        ])->save();

        $application->student->notify(new TeachingOfferApplicationNotification(
            $application,
            TeachingOfferApplicationNotification::EVENT_APPLICATION_CANCELLED_BY_TEACHER,
        ));

        if ($wasAccepted) {
            $this->promoteNextWaitlisted($application->offer);
        }

        return $application;
    }

    private function ensureLearningProfile(User $student): void
    {
        $profile = StudentProfile::firstOrCreate(
            ['user_id' => $student->id],
            [
                'current_level' => StudentProfile::LEVEL_MIXED,
                'preferred_learning_mode' => StudentProfile::MODE_ANY,
                'is_active' => true,
            ],
        );

        if (! $profile->is_active) {
            $profile->forceFill(['is_active' => true])->save();
        }
    }

    private function initialStatus(TeachingOffer $offer): string
    {
        if ($offer->session_type === TeachingOffer::SESSION_OPEN_PUBLIC) {
            if ($offer->hasSeatAvailable()) {
                return TeachingOfferApplication::STATUS_ACCEPTED;
            }

            if ($offer->waitingListHasRoom()) {
                return TeachingOfferApplication::STATUS_WAITLISTED;
            }

            throw ValidationException::withMessages([
                'application' => __('ui.applications.capacity_full_error'),
            ]);
        }

        if ($offer->hasSeatAvailable()) {
            return TeachingOfferApplication::STATUS_PENDING;
        }

        if ($offer->waitingListHasRoom()) {
            return TeachingOfferApplication::STATUS_WAITLISTED;
        }

        throw ValidationException::withMessages([
            'application' => __('ui.applications.capacity_full_error'),
        ]);
    }

    private function promoteNextWaitlisted(TeachingOffer $offer): ?TeachingOfferApplication
    {
        if (! $offer->hasSeatAvailable()) {
            return null;
        }

        $application = $offer->applications()
            ->where('status', TeachingOfferApplication::STATUS_WAITLISTED)
            ->orderBy('requested_at')
            ->orderBy('id')
            ->first();

        if (! $application) {
            return null;
        }

        $newStatus = $offer->session_type === TeachingOffer::SESSION_OPEN_PUBLIC
            ? TeachingOfferApplication::STATUS_ACCEPTED
            : TeachingOfferApplication::STATUS_PENDING;

        $application->forceFill([
            'status' => $newStatus,
            'accepted_at' => $newStatus === TeachingOfferApplication::STATUS_ACCEPTED ? now() : null,
        ])->save();

        $application->student->notify(new TeachingOfferApplicationNotification(
            $application,
            TeachingOfferApplicationNotification::EVENT_WAITING_LIST_PROMOTED,
        ));

        return $application;
    }
}

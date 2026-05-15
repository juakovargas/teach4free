<?php

namespace App\Services;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\TeacherReview;
use App\Models\TeachingOfferApplication;
use App\Models\User;

class ReviewEligibilityService
{
    public function canReview(User $user, ClassSession $session): bool
    {
        return $this->reason($user, $session) === null;
    }

    public function existingReview(User $user, ClassSession $session): ?TeacherReview
    {
        return TeacherReview::query()
            ->where('student_user_id', $user->id)
            ->where('class_session_id', $session->id)
            ->first();
    }

    public function reason(User $user, ClassSession $session): ?string
    {
        $session->loadMissing(['application', 'attendees']);

        if ($user->isRestricted()) {
            return 'restricted';
        }

        if ($session->status !== ClassSession::STATUS_COMPLETED) {
            return 'not_completed';
        }

        if ((int) $session->teacher_user_id === (int) $user->id) {
            return 'own_session';
        }

        if ($this->existingReview($user, $session)) {
            return 'already_reviewed';
        }

        if (! $this->participatedInSession($user, $session)) {
            return 'not_participant';
        }

        return null;
    }

    private function participatedInSession(User $user, ClassSession $session): bool
    {
        $attended = $session->attendees
            ->contains(fn (ClassSessionAttendee $attendance): bool => (int) $attendance->user_id === (int) $user->id
                && in_array($attendance->status, [
                    ClassSessionAttendee::STATUS_ATTENDED,
                    ClassSessionAttendee::STATUS_ENROLLED,
                ], true));

        if ($attended) {
            return true;
        }

        return $session->application
            && (int) $session->application->student_user_id === (int) $user->id
            && $session->application->status === TeachingOfferApplication::STATUS_ACCEPTED;
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\TeachingOfferApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->loadCount('userLanguages')->load([
            'studentProfile',
            'teacherProfile',
        ]);

        return Inertia::render('dashboard', [
            'summary' => [
                'preferred_locale' => $user->preferred_locale,
                'timezone' => $user->timezone ?? 'Europe/Madrid',
                'language_count' => $user->user_languages_count,
                'teaching_offers_count' => $user->teachingOffers()->count(),
                'teacher_availability_count' => $user->teacherAvailabilities()->where('is_active', true)->count(),
                'upcoming_student_sessions_count' => $user->sessionAttendances()
                    ->where('status', ClassSessionAttendee::STATUS_ENROLLED)
                    ->whereHas('session', fn ($query) => $query
                        ->where('status', ClassSession::STATUS_SCHEDULED)
                        ->where('starts_at', '>=', now()))
                    ->count(),
                'upcoming_teacher_sessions_count' => $user->taughtSessions()
                    ->where('status', ClassSession::STATUS_SCHEDULED)
                    ->where('starts_at', '>=', now())
                    ->count(),
                'pending_applications_count' => $user->learningApplications()
                    ->where('status', TeachingOfferApplication::STATUS_PENDING)
                    ->count(),
                'accepted_applications_count' => $user->learningApplications()
                    ->where('status', TeachingOfferApplication::STATUS_ACCEPTED)
                    ->count(),
                'waitlisted_applications_count' => $user->learningApplications()
                    ->where('status', TeachingOfferApplication::STATUS_WAITLISTED)
                    ->count(),
                'requests_to_my_offers_count' => $user->teachingApplications()
                    ->whereIn('status', [
                        TeachingOfferApplication::STATUS_PENDING,
                        TeachingOfferApplication::STATUS_WAITLISTED,
                    ])
                    ->count(),
                'unread_notifications_count' => $user->unreadNotifications()->count(),
                'student_status' => $user->studentProfile?->is_active ? 'active' : 'inactive',
                'teacher_status' => match (true) {
                    $user->teacherProfile?->is_active => 'active',
                    $user->teacherProfile !== null => 'paused',
                    default => 'not_activated',
                },
                'teacher_accepting_requests' => (bool) $user->teacherProfile?->is_accepting_requests,
            ],
        ]);
    }
}

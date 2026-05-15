<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\ConversationReport;
use App\Models\Incident;
use App\Models\TeacherReview;
use App\Models\TeachingOfferApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
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
        $reportsHavePublicResponse = Schema::hasTable('incidents')
            && Schema::hasColumn('incidents', 'public_response')
            && Schema::hasTable('conversation_reports')
            && Schema::hasColumn('conversation_reports', 'public_response');

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
                'open_reports_count' => Incident::query()
                    ->where('reporter_user_id', $user->id)
                    ->whereIn('status', [Incident::STATUS_OPEN, Incident::STATUS_IN_REVIEW])
                    ->count()
                    + ConversationReport::query()
                        ->where('reporter_user_id', $user->id)
                        ->whereIn('status', [ConversationReport::STATUS_OPEN, ConversationReport::STATUS_IN_REVIEW])
                        ->count(),
                'reports_with_response_count' => $reportsHavePublicResponse
                    ? Incident::query()
                        ->where('reporter_user_id', $user->id)
                        ->whereNotNull('public_response')
                        ->count()
                        + ConversationReport::query()
                            ->where('reporter_user_id', $user->id)
                            ->whereNotNull('public_response')
                            ->count()
                    : 0,
                'reviewable_sessions_count' => $user->sessionAttendances()
                    ->whereIn('status', [ClassSessionAttendee::STATUS_ATTENDED, ClassSessionAttendee::STATUS_ENROLLED])
                    ->whereHas('session', fn ($query) => $query
                        ->where('status', ClassSession::STATUS_COMPLETED)
                        ->where('teacher_user_id', '!=', $user->id)
                        ->whereDoesntHave('teacherReviews', fn ($query) => $query->where('student_user_id', $user->id)))
                    ->count(),
                'reviews_submitted_count' => $user->submittedTeacherReviews()->count(),
                'teacher_average_rating' => $user->receivedTeacherReviews()
                    ->publiclyVisible()
                    ->avg('rating'),
                'teacher_published_reviews_count' => $user->receivedTeacherReviews()
                    ->publiclyVisible()
                    ->count(),
                'teacher_pending_review_responses_count' => $user->receivedTeacherReviews()
                    ->publiclyVisible()
                    ->whereNull('teacher_response')
                    ->count(),
                'teacher_hidden_reviews_count' => $user->receivedTeacherReviews()
                    ->where('status', TeacherReview::STATUS_HIDDEN)
                    ->count(),
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

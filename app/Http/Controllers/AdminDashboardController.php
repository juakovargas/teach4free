<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Models\ClassSession;
use App\Models\ConversationReport;
use App\Models\Incident;
use App\Models\Language;
use App\Models\ReviewReport;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeacherReview;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        $lastWeek = now()->subDays(7);
        $hasConversationReports = Schema::hasTable('conversation_reports');
        $hasIncidents = Schema::hasTable('incidents');
        $hasTeacherReviews = Schema::hasTable('teacher_reviews');
        $hasReviewReports = Schema::hasTable('review_reports');
        $hasIncidentPublicResponses = $hasIncidents && Schema::hasColumn('incidents', 'public_response');
        $hasConversationReportPublicResponses = $hasConversationReports && Schema::hasColumn('conversation_reports', 'public_response');
        $hasNotifications = Schema::hasTable('notifications');
        $hasSessions = Schema::hasTable('class_sessions');
        $hasBadges = Schema::hasTable('badges');
        $hasUserBadges = Schema::hasTable('user_badges');
        $countryRows = User::query()
            ->whereNotNull('country_code')
            ->selectRaw('country_code, count(*) as users_count')
            ->groupBy('country_code')
            ->orderByDesc('users_count')
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => User::query()->count(),
                'active_students' => StudentProfile::query()->where('is_active', true)->count(),
                'active_teachers' => TeacherProfile::query()->where('is_active', true)->count(),
                'pending_teacher_verifications' => TeacherProfile::query()
                    ->where('is_active', true)
                    ->where('is_verified', false)
                    ->count(),
                'mixed_users' => User::query()
                    ->whereHas('studentProfile', fn ($query) => $query->where('is_active', true))
                    ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
                    ->count(),
                'published_teaching_offers' => TeachingOffer::query()->whereNotNull('published_at')->count(),
                'open_public_sessions' => TeachingOffer::query()
                    ->where('session_type', TeachingOffer::SESSION_OPEN_PUBLIC)
                    ->where('is_active', true)
                    ->count(),
                'pending_applications' => TeachingOfferApplication::query()
                    ->where('status', TeachingOfferApplication::STATUS_PENDING)
                    ->count(),
                'waitlisted_applications' => TeachingOfferApplication::query()
                    ->where('status', TeachingOfferApplication::STATUS_WAITLISTED)
                    ->count(),
                'open_incidents' => $hasIncidents ? Incident::query()
                    ->where('status', Incident::STATUS_OPEN)
                    ->count() : 0,
                'incidents_pending_review' => $hasIncidents ? Incident::query()
                    ->whereIn('status', [Incident::STATUS_OPEN, Incident::STATUS_IN_REVIEW])
                    ->count() : 0,
                'open_conversation_reports' => $hasConversationReports ? ConversationReport::query()
                    ->where('status', ConversationReport::STATUS_OPEN)
                    ->count() : 0,
                'open_review_reports' => $hasReviewReports ? ReviewReport::query()
                    ->where('status', ReviewReport::STATUS_OPEN)
                    ->count() : 0,
                'pending_moderation' => ($hasIncidents ? Incident::query()
                    ->where('status', Incident::STATUS_OPEN)
                    ->count() : 0)
                    + ($hasConversationReports ? ConversationReport::query()
                        ->where('status', ConversationReport::STATUS_OPEN)
                        ->count() : 0)
                    + ($hasReviewReports ? ReviewReport::query()
                        ->where('status', ReviewReport::STATUS_OPEN)
                        ->count() : 0),
                'reported_reviews' => $hasTeacherReviews ? TeacherReview::query()
                    ->where('reported_count', '>', 0)
                    ->count() : 0,
                'hidden_reviews' => $hasTeacherReviews ? TeacherReview::query()
                    ->where('status', TeacherReview::STATUS_HIDDEN)
                    ->count() : 0,
                'low_rated_reviews' => $hasTeacherReviews ? TeacherReview::query()
                    ->whereIn('rating', [1, 2])
                    ->count() : 0,
                'reports_awaiting_response' => ($hasIncidentPublicResponses ? Incident::query()
                    ->whereNotNull('reporter_user_id')
                    ->whereIn('status', Incident::STATUSES)
                    ->whereNull('public_response')
                    ->count() : 0)
                    + ($hasConversationReportPublicResponses ? ConversationReport::query()
                        ->whereNotNull('reporter_user_id')
                        ->whereIn('status', ConversationReport::STATUSES)
                        ->whereNull('public_response')
                        ->count() : 0),
                'banned_users' => User::query()->whereNotNull('banned_at')->count(),
                'blocked_users' => User::query()->whereNotNull('blocked_at')->count(),
                'active_languages' => Language::query()->where('is_active', true)->count(),
                'categories' => TeachingCategory::query()->count(),
                'subjects' => TeachingSubject::query()->count(),
                'internal_notifications_sent' => $hasNotifications ? DB::table('notifications')->count() : 0,
                'google_users' => User::query()->whereNotNull('google_id')->count(),
                'suspended_offers' => TeachingOffer::query()->where('is_active', false)->count(),
                'scheduled_sessions' => $hasSessions ? ClassSession::query()->where('status', ClassSession::STATUS_SCHEDULED)->count() : 0,
                'completed_sessions' => $hasSessions ? ClassSession::query()->where('status', ClassSession::STATUS_COMPLETED)->count() : 0,
                'cancelled_sessions' => $hasSessions ? ClassSession::query()->where('status', ClassSession::STATUS_CANCELLED)->count() : 0,
                'no_show_sessions' => $hasSessions ? ClassSession::query()->where('status', ClassSession::STATUS_NO_SHOW)->count() : 0,
                'upcoming_sessions_this_week' => $hasSessions ? ClassSession::query()
                    ->where('status', ClassSession::STATUS_SCHEDULED)
                    ->whereBetween('starts_at', [now(), now()->addWeek()])
                    ->count() : 0,
                'reports' => $hasIncidents ? Incident::query()->count() : 0,
                'reviews' => $hasTeacherReviews ? TeacherReview::query()->count() : 0,
                'active_badge_definitions' => $hasBadges ? Badge::query()->where('is_active', true)->count() : 0,
                'total_badges_awarded' => $hasUserBadges ? UserBadge::query()->count() : 0,
                'revoked_badges_count' => $hasUserBadges ? UserBadge::query()->whereNotNull('revoked_at')->count() : 0,
            ],
            'growth' => [
                'new_users' => User::query()->where('created_at', '>=', $lastWeek)->count(),
                'new_teachers' => TeacherProfile::query()->where('created_at', '>=', $lastWeek)->count(),
                'new_offers' => TeachingOffer::query()->where('created_at', '>=', $lastWeek)->count(),
                'new_applications' => TeachingOfferApplication::query()->where('created_at', '>=', $lastWeek)->count(),
            ],
            'activity' => [
                'latest_users' => User::query()
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'name', 'email', 'role', 'created_at', 'avatar_path', 'avatar_url']),
                'latest_offers' => TeachingOffer::query()
                    ->with('user:id,name,email,avatar_path,avatar_url')
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'user_id', 'title', 'slug', 'is_active', 'published_at', 'created_at']),
                'latest_applications' => TeachingOfferApplication::query()
                    ->with(['student:id,name,email,avatar_path,avatar_url', 'offer:id,title,slug'])
                    ->latest()
                    ->limit(5)
                    ->get(['id', 'student_user_id', 'teaching_offer_id', 'status', 'requested_at', 'created_at']),
                'latest_incidents' => $hasIncidents
                    ? Incident::query()
                        ->with('reporter:id,name,email,avatar_path,avatar_url')
                        ->latest()
                        ->limit(5)
                        ->get(['id', 'reporter_user_id', 'type', 'status', 'priority', 'subject', 'created_at'])
                    : [],
                'most_awarded_badges' => $hasBadges && $hasUserBadges
                    ? Badge::query()
                        ->withCount(['userBadges as active_awards_count' => fn ($query) => $query->whereNull('revoked_at')])
                        ->orderByDesc('active_awards_count')
                        ->orderBy('sort_order')
                        ->limit(5)
                        ->get(['id', 'key', 'name', 'icon', 'color'])
                    : [],
                'recent_badge_awards' => $hasUserBadges
                    ? UserBadge::query()
                        ->with(['badge:id,key,name,icon,color', 'user:id,name,email,avatar_path,avatar_url'])
                        ->latest('awarded_at')
                        ->limit(5)
                        ->get(['id', 'user_id', 'badge_id', 'awarded_at', 'revoked_at'])
                    : [],
                'teachers_with_most_badges' => $hasUserBadges
                    ? User::query()
                        ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
                        ->withCount(['userBadges as active_badges_count' => fn ($query) => $query->whereNull('revoked_at')])
                        ->orderByDesc('active_badges_count')
                        ->limit(5)
                        ->get(['id', 'name', 'email', 'avatar_path', 'avatar_url'])
                    : [],
            ],
            'world' => [
                'countries_represented' => User::query()->whereNotNull('country_code')->distinct('country_code')->count('country_code'),
                'located_users' => User::query()->whereNotNull('country_code')->count(),
                'top_countries' => $countryRows->map(fn ($row): array => [
                    'country_code' => (string) $row->country_code,
                    'users_count' => (int) $row->users_count,
                ]),
            ],
        ]);
    }
}

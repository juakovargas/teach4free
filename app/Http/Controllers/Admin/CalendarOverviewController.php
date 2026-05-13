<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\TeacherAvailability;
use App\Models\TeacherProfile;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CalendarOverviewController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/calendar-overview', [
            'availability' => [
                'by_weekday' => TeacherAvailability::query()
                    ->selectRaw('day_of_week, count(*) as blocks_count')
                    ->where('is_active', true)
                    ->groupBy('day_of_week')
                    ->orderByDesc('blocks_count')
                    ->get(),
                'by_timezone' => TeacherAvailability::query()
                    ->selectRaw('timezone, count(*) as blocks_count')
                    ->where('is_active', true)
                    ->groupBy('timezone')
                    ->orderByDesc('blocks_count')
                    ->limit(8)
                    ->get(),
                'top_teachers' => TeacherAvailability::query()
                    ->selectRaw('user_id, count(*) as blocks_count')
                    ->where('is_active', true)
                    ->with('user:id,name,email')
                    ->groupBy('user_id')
                    ->orderByDesc('blocks_count')
                    ->limit(8)
                    ->get(),
                'teachers_without_availability' => TeacherProfile::query()
                    ->where('is_active', true)
                    ->whereDoesntHave('user.teacherAvailabilities', fn ($query) => $query->where('is_active', true))
                    ->with('user:id,name,email')
                    ->limit(10)
                    ->get(),
            ],
            'sessions' => [
                'status_counts' => collect(ClassSession::STATUSES)->map(fn (string $status): array => [
                    'status' => $status,
                    'count' => ClassSession::query()->where('status', $status)->count(),
                ])->values(),
                'upcoming_by_day' => ClassSession::query()
                    ->where('starts_at', '>=', now())
                    ->selectRaw('DATE(starts_at) as date, count(*) as sessions_count')
                    ->groupBy('date')
                    ->orderBy('date')
                    ->limit(14)
                    ->get(),
                'active_categories' => ClassSession::query()
                    ->join('teaching_offers', 'class_sessions.teaching_offer_id', '=', 'teaching_offers.id')
                    ->join('teaching_categories', 'teaching_offers.teaching_category_id', '=', 'teaching_categories.id')
                    ->selectRaw('teaching_categories.name, teaching_categories.color, count(*) as sessions_count')
                    ->groupBy('teaching_categories.id', 'teaching_categories.name', 'teaching_categories.color')
                    ->orderByDesc('sessions_count')
                    ->limit(8)
                    ->get(),
                'active_subjects' => ClassSession::query()
                    ->join('teaching_offers', 'class_sessions.teaching_offer_id', '=', 'teaching_offers.id')
                    ->join('teaching_subjects', 'teaching_offers.teaching_subject_id', '=', 'teaching_subjects.id')
                    ->selectRaw('teaching_subjects.name, count(*) as sessions_count')
                    ->groupBy('teaching_subjects.id', 'teaching_subjects.name')
                    ->orderByDesc('sessions_count')
                    ->limit(8)
                    ->get(),
            ],
            'demand' => [
                'requested_weekdays' => TeachingOfferApplication::query()
                    ->whereNotNull('preferred_starts_at')
                    ->selectRaw('DAYOFWEEK(preferred_starts_at) as mysql_day, count(*) as applications_count')
                    ->groupBy('mysql_day')
                    ->orderByDesc('applications_count')
                    ->get()
                    ->map(fn ($row): array => [
                        'day_of_week' => $this->isoWeekday((int) $row->mysql_day),
                        'applications_count' => (int) $row->applications_count,
                    ]),
                'subjects_by_applications' => TeachingOfferApplication::query()
                    ->join('teaching_offers', 'teaching_offer_applications.teaching_offer_id', '=', 'teaching_offers.id')
                    ->join('teaching_subjects', 'teaching_offers.teaching_subject_id', '=', 'teaching_subjects.id')
                    ->selectRaw('teaching_subjects.name, count(*) as applications_count')
                    ->groupBy('teaching_subjects.id', 'teaching_subjects.name')
                    ->orderByDesc('applications_count')
                    ->limit(8)
                    ->get(),
                'waitlisted_offers' => TeachingOffer::query()
                    ->with('user:id,name,email')
                    ->withCount(['applications as waitlisted_count' => fn ($query) => $query->where('status', TeachingOfferApplication::STATUS_WAITLISTED)])
                    ->having('waitlisted_count', '>', 0)
                    ->orderByDesc('waitlisted_count')
                    ->limit(8)
                    ->get(['id', 'slug', 'title', 'user_id']),
                'average_pending_per_offer' => round((float) TeachingOffer::query()
                    ->withCount(['applications as pending_count' => fn ($query) => $query->where('status', TeachingOfferApplication::STATUS_PENDING)])
                    ->get()
                    ->avg('pending_count'), 2),
            ],
            'summary' => [
                'availability_blocks' => TeacherAvailability::query()->where('is_active', true)->count(),
                'sessions' => ClassSession::query()->count(),
                'upcoming_sessions' => ClassSession::query()->where('status', ClassSession::STATUS_SCHEDULED)->where('starts_at', '>=', Carbon::now())->count(),
                'applications' => TeachingOfferApplication::query()->count(),
                'pending_applications' => TeachingOfferApplication::query()->where('status', TeachingOfferApplication::STATUS_PENDING)->count(),
            ],
        ]);
    }

    private function isoWeekday(int $mysqlDay): int
    {
        return $mysqlDay === 1 ? 7 : $mysqlDay - 1;
    }
}

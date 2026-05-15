<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\Incident;
use App\Models\TeacherReview;
use App\Models\User;
use App\Services\TeacherReputationService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReputationController extends Controller
{
    public function __construct(private readonly TeacherReputationService $reputations) {}

    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'reliability_label' => ['nullable', 'string', Rule::in([
                'all',
                TeacherReputationService::LABEL_NEW_TEACHER,
                TeacherReputationService::LABEL_EXCELLENT,
                TeacherReputationService::LABEL_RELIABLE,
                TeacherReputationService::LABEL_NEEDS_ATTENTION,
            ])],
            'min_completed_sessions' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'low_rating' => ['nullable'],
            'high_cancellation_rate' => ['nullable'],
            'high_no_show_rate' => ['nullable'],
            'new_teachers' => ['nullable'],
        ]);

        $filters = [
            'search' => $validated['search'] ?? '',
            'reliability_label' => $validated['reliability_label'] ?? 'all',
            'min_completed_sessions' => (int) ($validated['min_completed_sessions'] ?? 0),
            'low_rating' => $request->boolean('low_rating'),
            'high_cancellation_rate' => $request->boolean('high_cancellation_rate'),
            'high_no_show_rate' => $request->boolean('high_no_show_rate'),
            'new_teachers' => $request->boolean('new_teachers'),
        ];

        $teachers = User::query()
            ->whereHas('teacherProfile')
            ->with('teacherProfile:id,user_id,headline,is_active,is_verified,activated_at')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'avatar_path', 'avatar_url', 'city', 'country_code', 'created_at']);
        $teacherIds = $teachers->pluck('id')->values();
        $reputationSummaries = $this->reputations->forTeachers($teachers);
        $reportedReviews = $this->reportedReviewsByTeacher($teacherIds);
        $hiddenReviews = $this->hiddenReviewsByTeacher($teacherIds);
        $incidents = $this->incidentsByTeacher($teacherIds);
        $lastSessions = $this->lastSessionsByTeacher($teacherIds);

        $rows = $teachers
            ->map(function (User $teacher) use ($reputationSummaries, $reportedReviews, $hiddenReviews, $incidents, $lastSessions): array {
                $summary = $reputationSummaries[$teacher->id] ?? $this->reputations->forTeacher($teacher);

                return [
                    'teacher' => [
                        'id' => $teacher->id,
                        'name' => $teacher->name,
                        'email' => $teacher->email,
                        'avatar' => $teacher->avatar,
                        'initials' => $teacher->initials,
                        'headline' => $teacher->teacherProfile?->headline,
                        'city' => $teacher->city,
                        'country_code' => $teacher->country_code,
                        'is_active' => (bool) $teacher->teacherProfile?->is_active,
                        'is_verified' => (bool) $teacher->teacherProfile?->is_verified,
                        'public_profile_url' => $teacher->teacherProfile?->is_active ? route('teachers.show', $teacher) : null,
                        'admin_user_url' => route('admin.users.show', $teacher),
                    ],
                    'reputation' => $summary,
                    'reported_reviews_count' => $reportedReviews[$teacher->id] ?? 0,
                    'hidden_reviews_count' => $hiddenReviews[$teacher->id] ?? 0,
                    'incidents_count' => $incidents[$teacher->id] ?? 0,
                    'last_session_at' => $lastSessions[$teacher->id] ?? null,
                    'admin_reviews_url' => route('admin.reviews.index', ['search' => $teacher->email]),
                    'admin_sessions_url' => route('admin.sessions.index', ['search' => $teacher->email]),
                ];
            });
        $summary = $this->summaryForRows($rows);

        $rows = $rows
            ->filter(fn (array $row): bool => $this->matchesFilters($row, $filters))
            ->sort(function (array $first, array $second): int {
                $priority = [
                    TeacherReputationService::LABEL_NEEDS_ATTENTION => 0,
                    TeacherReputationService::LABEL_NEW_TEACHER => 1,
                    TeacherReputationService::LABEL_EXCELLENT => 2,
                    TeacherReputationService::LABEL_RELIABLE => 3,
                ];

                return (($priority[$first['reputation']['reliability_label']] ?? 9) <=> ($priority[$second['reputation']['reliability_label']] ?? 9))
                    ?: ($second['reputation']['completed_sessions_count'] <=> $first['reputation']['completed_sessions_count'])
                    ?: strcasecmp($first['teacher']['name'], $second['teacher']['name']);
            })
            ->values();

        return Inertia::render('admin/reputation/index', [
            'teachers' => $rows,
            'filters' => $filters,
            'summary' => [
                ...$summary,
                'filtered' => $rows->count(),
            ],
            'labels' => [
                TeacherReputationService::LABEL_NEW_TEACHER,
                TeacherReputationService::LABEL_EXCELLENT,
                TeacherReputationService::LABEL_RELIABLE,
                TeacherReputationService::LABEL_NEEDS_ATTENTION,
            ],
        ]);
    }

    private function matchesFilters(array $row, array $filters): bool
    {
        $summary = $row['reputation'];
        $search = trim((string) $filters['search']);

        if ($search !== '') {
            $haystack = strtolower(implode(' ', [
                $row['teacher']['name'],
                $row['teacher']['email'],
                $row['teacher']['headline'],
                $row['teacher']['city'],
                $row['teacher']['country_code'],
            ]));

            if (! str_contains($haystack, strtolower($search))) {
                return false;
            }
        }

        if ($filters['reliability_label'] !== 'all' && $summary['reliability_label'] !== $filters['reliability_label']) {
            return false;
        }

        if ($summary['completed_sessions_count'] < $filters['min_completed_sessions']) {
            return false;
        }

        if ($filters['low_rating'] && ! ($summary['average_rating'] !== null && $summary['average_rating'] < 4.0)) {
            return false;
        }

        if ($filters['high_cancellation_rate'] && $summary['cancellation_rate'] <= 15) {
            return false;
        }

        if ($filters['high_no_show_rate'] && $summary['no_show_rate'] <= 10) {
            return false;
        }

        if ($filters['new_teachers'] && $summary['reliability_label'] !== TeacherReputationService::LABEL_NEW_TEACHER) {
            return false;
        }

        return true;
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @return array<string, int>
     */
    private function summaryForRows($rows): array
    {
        return [
            'total' => $rows->count(),
            'new_teacher' => $rows->where('reputation.reliability_label', TeacherReputationService::LABEL_NEW_TEACHER)->count(),
            'excellent' => $rows->where('reputation.reliability_label', TeacherReputationService::LABEL_EXCELLENT)->count(),
            'reliable' => $rows->where('reputation.reliability_label', TeacherReputationService::LABEL_RELIABLE)->count(),
            'needs_attention' => $rows->where('reputation.reliability_label', TeacherReputationService::LABEL_NEEDS_ATTENTION)->count(),
        ];
    }

    /**
     * @param  Collection<int, int>  $teacherIds
     * @return array<int, int>
     */
    private function reportedReviewsByTeacher($teacherIds): array
    {
        return TeacherReview::query()
            ->whereIn('teacher_user_id', $teacherIds)
            ->where('reported_count', '>', 0)
            ->selectRaw('teacher_user_id, count(*) as reviews_count')
            ->groupBy('teacher_user_id')
            ->pluck('reviews_count', 'teacher_user_id')
            ->map(fn ($count): int => (int) $count)
            ->all();
    }

    /**
     * @param  Collection<int, int>  $teacherIds
     * @return array<int, int>
     */
    private function hiddenReviewsByTeacher($teacherIds): array
    {
        return TeacherReview::query()
            ->whereIn('teacher_user_id', $teacherIds)
            ->where('status', TeacherReview::STATUS_HIDDEN)
            ->selectRaw('teacher_user_id, count(*) as reviews_count')
            ->groupBy('teacher_user_id')
            ->pluck('reviews_count', 'teacher_user_id')
            ->map(fn ($count): int => (int) $count)
            ->all();
    }

    /**
     * @param  Collection<int, int>  $teacherIds
     * @return array<int, int>
     */
    private function incidentsByTeacher($teacherIds): array
    {
        return Incident::query()
            ->whereIn('reported_user_id', $teacherIds)
            ->selectRaw('reported_user_id, count(*) as incidents_count')
            ->groupBy('reported_user_id')
            ->pluck('incidents_count', 'reported_user_id')
            ->map(fn ($count): int => (int) $count)
            ->all();
    }

    /**
     * @param  Collection<int, int>  $teacherIds
     * @return array<int, string|null>
     */
    private function lastSessionsByTeacher($teacherIds): array
    {
        return ClassSession::query()
            ->whereIn('teacher_user_id', $teacherIds)
            ->selectRaw('teacher_user_id, max(starts_at) as last_session_at')
            ->groupBy('teacher_user_id')
            ->pluck('last_session_at', 'teacher_user_id')
            ->all();
    }
}

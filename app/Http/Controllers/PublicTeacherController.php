<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\ReviewReport;
use App\Models\TeacherReview;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Services\TeacherReputationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicTeacherController extends Controller
{
    public function __construct(private readonly TeacherReputationService $reputations) {}

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'language' => $request->string('language')->toString(),
            'category' => $request->string('category')->toString(),
            'subject' => $request->string('subject')->toString(),
            'country' => $request->string('country')->toString(),
            'availability' => $request->string('availability')->toString(),
            'sort' => $request->string('sort')->toString(),
        ];

        $teachers = User::query()
            ->whereHas('teacherProfile', fn (Builder $query) => $query->where('is_active', true))
            ->with([
                'teacherProfile:id,user_id,headline,teaching_bio,experience_summary,preferred_teaching_mode,is_verified,is_accepting_requests,banner_path,activated_at,show_badges,show_location',
                'userLanguages' => fn ($query) => $query
                    ->where('teaches', true)
                    ->with('language:id,code,name,native_name'),
                'userBadges' => fn ($query) => $query
                    ->publiclyVisible()
                    ->with('badge')
                    ->orderByDesc('is_featured')
                    ->orderBy('featured_sort_order'),
                'teachingOffers' => fn ($query) => $query
                    ->publiclyVisible()
                    ->with(['category:id,name,slug,color', 'subject:id,name,slug'])
                    ->latest('published_at'),
            ])
            ->withCount(['teachingOffers as active_offers_count' => fn ($query) => $query->publiclyVisible()])
            ->when($filters['search'], function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhereHas('teacherProfile', function (Builder $query) use ($search): void {
                            $query
                                ->where('headline', 'like', "%{$search}%")
                                ->orWhere('teaching_bio', 'like', "%{$search}%")
                                ->orWhere('experience_summary', 'like', "%{$search}%");
                        })
                        ->orWhereHas('teachingOffers', function (Builder $query) use ($search): void {
                            $query->publiclyVisible()
                                ->where(function (Builder $query) use ($search): void {
                                    $query
                                        ->where('title', 'like', "%{$search}%")
                                        ->orWhere('summary', 'like', "%{$search}%")
                                        ->orWhereHas('category', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"))
                                        ->orWhereHas('subject', fn (Builder $query) => $query->where('name', 'like', "%{$search}%"));
                                });
                        });
                });
            })
            ->when($filters['language'], function (Builder $query, string $code): void {
                $query->where(function (Builder $query) use ($code): void {
                    $query
                        ->whereHas('userLanguages', fn (Builder $query) => $query
                            ->where('teaches', true)
                            ->whereHas('language', fn (Builder $query) => $query->where('code', $code)))
                        ->orWhereHas('teachingOffers.languages', fn (Builder $query) => $query->where('code', $code));
                });
            })
            ->when($filters['category'], fn (Builder $query, string $slug) => $query->whereHas('teachingOffers', fn (Builder $query) => $query->publiclyVisible()->whereHas('category', fn (Builder $query) => $query->where('slug', $slug))))
            ->when($filters['subject'], fn (Builder $query, string $slug) => $query->whereHas('teachingOffers', fn (Builder $query) => $query->publiclyVisible()->whereHas('subject', fn (Builder $query) => $query->where('slug', $slug))))
            ->when($filters['country'], fn (Builder $query, string $country) => $query->where('country_code', $country))
            ->when($filters['availability'], function (Builder $query, string $availability): void {
                $query->where(function (Builder $query) use ($availability): void {
                    $query
                        ->whereHas('teacherAvailabilities', fn (Builder $query) => $query->where('notes', 'like', "%{$availability}%"))
                        ->orWhereHas('teachingOffers', fn (Builder $query) => $query->publiclyVisible()->where('availability_summary', 'like', "%{$availability}%"));
                });
            })
            ->orderByDesc('active_offers_count')
            ->orderBy('name')
            ->get(['id', 'name', 'avatar_path', 'avatar_url', 'city', 'country_code', 'created_at']);

        $reputationSummaries = $this->reputations->forTeachers($teachers);
        $teachers = $this->sortTeachers($teachers, $reputationSummaries, $filters['sort']);

        return Inertia::render('teachers/index', [
            'teachers' => $teachers
                ->map(fn (User $teacher): array => $this->teacherCardPayload(
                    $teacher,
                    $reputationSummaries[$teacher->id] ?? null,
                ))
                ->values(),
            'filters' => $filters,
            'categories' => TeachingCategory::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'color']),
            'subjects' => TeachingSubject::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'teaching_category_id', 'name', 'slug']),
            'languages' => Language::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'native_name']),
            'countries' => User::query()
                ->whereHas('teacherProfile', fn (Builder $query) => $query->where('is_active', true))
                ->whereNotNull('country_code')
                ->distinct()
                ->orderBy('country_code')
                ->pluck('country_code')
                ->values(),
        ]);
    }

    public function show(Request $request, User $user): Response
    {
        abort_unless($user->teacherProfile?->is_active, 404);

        $user->load([
            'teacherProfile:id,user_id,headline,teaching_bio,experience_summary,public_intro,preferred_teaching_mode,max_students_per_session,default_session_duration_minutes,is_verified,is_accepting_requests,banner_path,profile_accent_color,show_badges,show_reviews,show_reputation_summary,show_completed_sessions_count,show_students_helped_count,show_teaching_hours,show_location,show_availability_summary',
            'userLanguages' => fn ($query) => $query
                ->where('teaches', true)
                ->with('language:id,code,name,native_name'),
            'userBadges' => fn ($query) => $query
                ->publiclyVisible()
                ->with('badge')
                ->orderByDesc('is_featured')
                ->orderBy('featured_sort_order')
                ->latest('awarded_at'),
            'teacherAvailabilities' => fn ($query) => $query
                ->where('is_active', true)
                ->orderBy('day_of_week')
                ->orderBy('starts_at'),
            'teachingOffers' => fn ($query) => $query
                ->publiclyVisible()
                ->with(['category:id,name,slug,color', 'subject:id,name,slug', 'languages:id,code,name,native_name'])
                ->latest('published_at'),
        ]);

        $reputation = $this->reputations->forTeacher($user);
        $profile = $user->teacherProfile;
        $showReviews = (bool) $profile?->show_reviews;

        return Inertia::render('teachers/show', [
            'teacher' => [
                ...$this->teacherCardPayload($user, $reputation),
                'banner' => $user->teacherProfile?->banner,
                'teaching_bio' => $user->teacherProfile?->teaching_bio,
                'experience_summary' => $user->teacherProfile?->experience_summary,
                'public_intro' => $user->teacherProfile?->public_intro,
                'profile_accent_color' => $user->teacherProfile?->profile_accent_color,
                'preferred_teaching_mode' => $user->teacherProfile?->preferred_teaching_mode,
                'max_students_per_session' => $user->teacherProfile?->max_students_per_session,
                'default_session_duration_minutes' => $user->teacherProfile?->default_session_duration_minutes,
                'is_accepting_requests' => (bool) $user->teacherProfile?->is_accepting_requests,
                'visibility' => [
                    'show_badges' => (bool) $profile?->show_badges,
                    'show_reviews' => $showReviews,
                    'show_reputation_summary' => (bool) $profile?->show_reputation_summary,
                    'show_completed_sessions_count' => (bool) $profile?->show_completed_sessions_count,
                    'show_students_helped_count' => (bool) $profile?->show_students_helped_count,
                    'show_teaching_hours' => (bool) $profile?->show_teaching_hours,
                    'show_location' => (bool) $profile?->show_location,
                    'show_availability_summary' => (bool) $profile?->show_availability_summary,
                ],
                'badges' => $this->badgePayloads($user),
                'availability' => $user->teacherAvailabilities->map(fn ($availability): array => [
                    'day_of_week' => $availability->day_of_week,
                    'starts_at' => substr((string) $availability->starts_at, 0, 5),
                    'ends_at' => substr((string) $availability->ends_at, 0, 5),
                    'timezone' => $availability->timezone,
                    'notes' => $availability->notes,
                ])->values(),
            ],
            'reputationSummary' => $reputation,
            'reviewSummary' => $this->ratingSummaryForTeacher($user, $reputation),
            'reviews' => $showReviews ? TeacherReview::query()
                ->publiclyVisible()
                ->where('teacher_user_id', $user->id)
                ->with(['student:id,name,avatar_path,avatar_url', 'session:id,title,starts_at', 'offer:id,title,slug'])
                ->latest()
                ->limit(12)
                ->get()
                ->map(fn (TeacherReview $review): array => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'comment' => $review->comment,
                    'teacher_response' => $review->teacher_response,
                    'teacher_responded_at' => $review->teacher_responded_at,
                    'created_at' => $review->created_at,
                    'can_report' => $request->user() && (int) $request->user()->id !== (int) $review->student_user_id,
                    'student' => [
                        'name' => $review->student?->name,
                        'avatar' => $review->student?->avatar,
                    ],
                    'session' => $review->session ? [
                        'title' => $review->session->title,
                        'starts_at' => $review->session->starts_at,
                    ] : null,
                    'offer' => $review->offer ? [
                        'title' => $review->offer->title,
                        'slug' => $review->offer->slug,
                    ] : null,
                ])->values() : [],
            'reviewReportTypes' => ReviewReport::TYPES,
            'offers' => $user->teachingOffers
                ->map(fn (TeachingOffer $offer): array => $this->offerPayload($offer, $reputation))
                ->values(),
            'openOffers' => $user->teachingOffers
                ->where('session_type', TeachingOffer::SESSION_OPEN_PUBLIC)
                ->map(fn (TeachingOffer $offer): array => $this->offerPayload($offer, $reputation))
                ->values(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function teacherCardPayload(User $teacher, ?array $reputation = null): array
    {
        $offers = $teacher->teachingOffers;
        $reputation ??= $this->reputations->forTeacher($teacher);

        return [
            'id' => $teacher->id,
            'name' => $teacher->name,
            'avatar' => $teacher->avatar,
            'initials' => $teacher->initials,
            'headline' => $teacher->teacherProfile?->headline,
            'teaching_bio_excerpt' => str($teacher->teacherProfile?->teaching_bio ?? '')->limit(180)->toString(),
            'city' => $teacher->teacherProfile?->show_location ? $teacher->city : null,
            'country_code' => $teacher->teacherProfile?->show_location ? $teacher->country_code : null,
            'is_verified' => (bool) $teacher->teacherProfile?->is_verified,
            'active_offers_count' => (int) ($teacher->active_offers_count ?? $offers->count()),
            'rating_summary' => [
                'average' => $reputation['average_rating'],
                'count' => $reputation['published_review_count'],
            ],
            'reputation_summary' => $reputation,
            'featured_badges' => $this->badgePayloads($teacher, true, 3),
            'visible_badges_count' => $teacher->teacherProfile?->show_badges ? $teacher->userBadges->count() : 0,
            'languages' => $teacher->userLanguages
                ->map(fn ($userLanguage): array => [
                    'code' => $userLanguage->language->code,
                    'name' => $userLanguage->language->name,
                    'native_name' => $userLanguage->language->native_name,
                ])
                ->take(4)
                ->values(),
            'categories' => $offers
                ->pluck('category')
                ->filter()
                ->unique('id')
                ->take(3)
                ->map(fn ($category): array => [
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'color' => $category->color,
                ])
                ->values(),
            'subjects' => $offers
                ->pluck('subject')
                ->filter()
                ->unique('id')
                ->take(3)
                ->map(fn ($subject): array => [
                    'name' => $subject->name,
                    'slug' => $subject->slug,
                ])
                ->values(),
            'profile_url' => route('teachers.show', $teacher),
            'offers_url' => route('offers.index', ['teacher' => $teacher->id]),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function offerPayload(TeachingOffer $offer, ?array $reputation = null): array
    {
        $reputation ??= $this->reputations->forTeacher($offer->user);

        return [
            'id' => $offer->id,
            'slug' => $offer->slug,
            'title' => $offer->title,
            'summary' => $offer->summary,
            'level' => $offer->level,
            'teaching_mode' => $offer->teaching_mode,
            'session_type' => $offer->session_type,
            'duration_minutes' => $offer->duration_minutes,
            'availability_summary' => $offer->availability_summary,
            'teacher' => [
                'id' => $offer->user_id,
                'name' => $offer->user->name,
                'avatar' => $offer->user->avatar,
                'city' => $offer->user->city,
                'country_code' => $offer->user->country_code,
                'profile_url' => route('teachers.show', $offer->user),
                'rating_summary' => [
                    'average' => $reputation['average_rating'],
                    'count' => $reputation['published_review_count'],
                ],
                'reputation_summary' => $reputation,
            ],
            'category' => $offer->category,
            'subject' => $offer->subject,
            'languages' => $offer->languages,
            'url' => route('offers.show', $offer),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function ratingSummaryForTeacher(User $teacher, ?array $reputation = null): array
    {
        $reputation ??= $this->reputations->forTeacher($teacher);
        $baseQuery = TeacherReview::query()
            ->publiclyVisible()
            ->where('teacher_user_id', $teacher->id);

        $count = (int) $reputation['published_review_count'];

        return [
            'average' => $reputation['average_rating'],
            'count' => $count,
            'distribution' => collect([5, 4, 3, 2, 1])
                ->mapWithKeys(fn (int $rating): array => [
                    $rating => (clone $baseQuery)->where('rating', $rating)->count(),
                ]),
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function badgePayloads(User $teacher, bool $featuredOnly = false, ?int $limit = null)
    {
        if (! $teacher->teacherProfile?->show_badges) {
            return collect();
        }

        $badges = $teacher->relationLoaded('userBadges')
            ? $teacher->userBadges
            : $teacher->userBadges()
                ->publiclyVisible()
                ->with('badge')
                ->orderByDesc('is_featured')
                ->orderBy('featured_sort_order')
                ->latest('awarded_at')
                ->get();

        $badges = $badges
            ->when($featuredOnly, fn ($badges) => $badges->where('is_featured', true))
            ->sortBy([
                ['is_featured', 'desc'],
                ['featured_sort_order', 'asc'],
                ['awarded_at', 'desc'],
            ]);

        if ($limit !== null) {
            $badges = $badges->take($limit);
        }

        return $badges
            ->map(fn ($badge): array => $badge->publicPayload())
            ->values();
    }

    /**
     * @param  Collection<int, User>  $teachers
     * @param  array<int, array<string, mixed>>  $reputationSummaries
     * @return Collection<int, User>
     */
    private function sortTeachers($teachers, array $reputationSummaries, string $sort)
    {
        return match ($sort) {
            'highest_rated' => $teachers->sort(function (User $first, User $second) use ($reputationSummaries): int {
                $firstSummary = $reputationSummaries[$first->id] ?? [];
                $secondSummary = $reputationSummaries[$second->id] ?? [];

                return (($secondSummary['average_rating'] ?? -1) <=> ($firstSummary['average_rating'] ?? -1))
                    ?: (($secondSummary['published_review_count'] ?? 0) <=> ($firstSummary['published_review_count'] ?? 0))
                    ?: strcasecmp($first->name, $second->name);
            }),
            'most_reviewed' => $teachers->sort(function (User $first, User $second) use ($reputationSummaries): int {
                return (($reputationSummaries[$second->id]['published_review_count'] ?? 0) <=> ($reputationSummaries[$first->id]['published_review_count'] ?? 0))
                    ?: strcasecmp($first->name, $second->name);
            }),
            'most_sessions' => $teachers->sort(function (User $first, User $second) use ($reputationSummaries): int {
                return (($reputationSummaries[$second->id]['completed_sessions_count'] ?? 0) <=> ($reputationSummaries[$first->id]['completed_sessions_count'] ?? 0))
                    ?: strcasecmp($first->name, $second->name);
            }),
            'new_teachers' => $teachers->sort(function (User $first, User $second): int {
                $firstDate = $first->teacherProfile?->activated_at ?? $first->created_at;
                $secondDate = $second->teacherProfile?->activated_at ?? $second->created_at;

                return ($secondDate?->timestamp ?? 0) <=> ($firstDate?->timestamp ?? 0)
                    ?: strcasecmp($first->name, $second->name);
            }),
            default => $teachers,
        };
    }
}

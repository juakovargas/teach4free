<?php

namespace App\Http\Controllers;

use App\Models\ClassSessionAttendee;
use App\Models\Language;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Services\SeoService;
use App\Services\TeacherReputationService;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class PublicOfferController extends Controller
{
    public function __construct(
        private readonly TeacherReputationService $reputations,
        private readonly SeoService $seo,
    ) {}

    public function index(Request $request): Response
    {
        $filters = [
            'search' => $request->string('search')->toString(),
            'category' => $request->string('category')->toString(),
            'subject' => $request->string('subject')->toString(),
            'language' => $request->string('language')->toString(),
            'level' => $request->string('level')->toString(),
            'teaching_mode' => $request->string('teaching_mode')->toString(),
            'session_type' => $request->string('session_type')->toString(),
            'availability' => $request->string('availability')->toString(),
            'teacher' => $request->string('teacher')->toString(),
            'accepting' => $request->boolean('accepting'),
            'sort' => $request->string('sort')->toString(),
        ];

        $offers = TeachingOffer::query()
            ->publiclyVisible()
            ->with([
                'user:id,name,avatar_path,avatar_url,city,country_code',
                'user.teacherProfile:id,user_id,is_active,show_badges,show_reviews,show_reputation_summary,show_completed_sessions_count,show_students_helped_count,show_teaching_hours,show_location',
                'user.userBadges' => fn ($query) => $query
                    ->publiclyVisible()
                    ->with('badge')
                    ->orderByDesc('is_featured')
                    ->orderBy('featured_sort_order'),
                'category:id,name,slug,color',
                'subject:id,name,slug',
                'languages:id,code,name,native_name',
            ])
            ->when($filters['search'], function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('summary', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['category'], fn ($query, string $slug) => $query->whereHas('category', fn ($query) => $query->where('slug', $slug)))
            ->when($filters['subject'], fn ($query, string $slug) => $query->whereHas('subject', fn ($query) => $query->where('slug', $slug)))
            ->when($filters['language'], fn ($query, string $code) => $query->whereHas('languages', fn ($query) => $query->where('code', $code)))
            ->when($filters['level'], fn ($query, string $level) => $query->where('level', $level))
            ->when($filters['teaching_mode'], fn ($query, string $mode) => $query->where('teaching_mode', $mode))
            ->when($filters['session_type'], fn ($query, string $type) => $query->where('session_type', $type))
            ->when($filters['availability'], fn ($query, string $availability) => $query->where('availability_summary', 'like', "%{$availability}%"))
            ->when($filters['teacher'], fn ($query, string $teacher) => $query->where('user_id', $teacher))
            ->when($filters['accepting'], fn ($query) => $query->where('is_accepting_applications', true))
            ->latest('published_at')
            ->get();

        $reputationSummaries = $this->reputations->forTeachers($offers->pluck('user')->filter()->unique('id'));
        $offers = $this->sortOffers($offers, $reputationSummaries, $filters['sort']);

        return Inertia::render('offers/index', [
            'offers' => $offers
                ->map(fn (TeachingOffer $offer): array => $this->offerIndexPayload(
                    $offer,
                    $reputationSummaries[$offer->user_id] ?? null,
                ))
                ->values(),
            'filters' => $filters,
            'filteredTeacher' => $filters['teacher']
                ? User::query()->find($filters['teacher'], ['id', 'name'])
                : null,
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
            'levels' => TeachingOffer::LEVELS,
            'teachingModes' => TeachingOffer::MODES,
            'sessionTypes' => TeachingOffer::SESSION_TYPES,
            'seo' => $this->seo->metadata([
                'title' => __('ui.seo.offers.title'),
                'description' => __('ui.seo.offers.description'),
                'canonicalUrl' => route('offers.index'),
                'robots' => 'index,follow',
                'ogType' => 'website',
                'structuredData' => [
                    $this->seo->webPageSchema(
                        'CollectionPage',
                        __('ui.seo.offers.title'),
                        __('ui.seo.offers.description'),
                        route('offers.index'),
                    ),
                ],
            ]),
        ]);
    }

    public function show(Request $request, TeachingOffer $offer): Response
    {
        abort_unless($offer->is_public && $offer->is_active && $offer->published_at !== null, 404);

        $offer->load([
            'user:id,name,avatar_path,avatar_url,bio,city,country_code',
            'user.teacherProfile:id,user_id,headline,teaching_bio,is_active,is_verified,banner_path,show_badges,show_reviews,show_reputation_summary,show_completed_sessions_count,show_students_helped_count,show_teaching_hours,show_location',
            'user.userLanguages' => fn ($query) => $query
                ->where('teaches', true)
                ->with('language:id,code,name,native_name'),
            'user.userBadges' => fn ($query) => $query
                ->publiclyVisible()
                ->with('badge')
                ->orderByDesc('is_featured')
                ->orderBy('featured_sort_order'),
            'user.teacherAvailabilities' => fn ($query) => $query->where('is_active', true)->orderBy('day_of_week')->orderBy('starts_at'),
            'category:id,name,slug,color',
            'subject:id,name,slug',
            'languages:id,code,name,native_name',
            'sessions' => fn ($query) => $query
                ->withCount(['attendees as enrolled_attendees_count' => fn ($query) => $query->where('status', ClassSessionAttendee::STATUS_ENROLLED)])
                ->where('status', 'scheduled')
                ->where('starts_at', '>=', now())
                ->orderBy('starts_at')
                ->limit(5),
        ]);

        $currentApplication = null;
        $isOwnOffer = false;

        if ($request->user()) {
            $isOwnOffer = $offer->user_id === $request->user()->id;
            $currentApplication = $offer->applications()
                ->where('student_user_id', $request->user()->id)
                ->whereIn('status', TeachingOfferApplication::ACTIVE_STATUSES)
                ->with('conversation:id,teaching_offer_application_id')
                ->latest('requested_at')
                ->first();
        }

        return Inertia::render('offers/show', [
            'offer' => $this->offerShowPayload($offer),
            'seatSummary' => [
                'accepted_count' => $offer->acceptedApplicationsCount(),
                'waitlisted_count' => $offer->waitlistedApplicationsCount(),
                'available_seats' => $offer->availableSeats(),
                'allow_waiting_list' => $offer->allow_waiting_list,
                'waiting_list_limit' => $offer->waiting_list_limit,
            ],
            'currentApplication' => $currentApplication ? [
                'id' => $currentApplication->id,
                'status' => $currentApplication->status,
                'conversation_id' => $currentApplication->conversation?->id,
            ] : null,
            'isOwnOffer' => $isOwnOffer,
            'visibleMeetingUrl' => $this->visibleMeetingUrl($offer, $currentApplication),
            'teacherAvailability' => [
                'timezone' => $offer->user->teacherAvailabilities->first()?->timezone ?? $offer->timezone,
                'weekly' => $offer->user->teacherAvailabilities->map(fn ($availability): array => [
                    'day_of_week' => $availability->day_of_week,
                    'starts_at' => substr((string) $availability->starts_at, 0, 5),
                    'ends_at' => substr((string) $availability->ends_at, 0, 5),
                    'timezone' => $availability->timezone,
                ]),
            ],
            'upcomingSessions' => $offer->sessions->map(fn ($session): array => [
                'id' => $session->id,
                'title' => $session->title,
                'starts_at' => $session->starts_at,
                'ends_at' => $session->ends_at,
                'timezone' => $session->timezone,
                'capacity' => $session->capacity,
                'enrolled_attendees_count' => $session->enrolled_attendees_count,
                'status' => $session->status,
            ]),
            'seo' => $this->offerSeo($offer),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function offerSeo(TeachingOffer $offer): array
    {
        $description = $this->offerSeoDescription($offer);
        $teacherImage = $this->seo->teacherProfileImageUrl($offer->user);

        return $this->seo->metadata([
            'title' => __('ui.seo.offer.title', ['offer' => $offer->title]),
            'description' => $description,
            'canonicalUrl' => route('offers.show', $offer),
            'ogType' => 'article',
            'ogImage' => $teacherImage,
            'structuredData' => [
                $this->seo->courseSchema($offer, $description),
            ],
        ]);
    }

    private function offerSeoDescription(TeachingOffer $offer): string
    {
        $base = $this->seo->excerpt($offer->summary ?: $offer->description, 130);
        $languages = $offer->languages
            ->pluck('name')
            ->filter()
            ->take(3)
            ->implode(', ');
        $category = $offer->category?->name;

        return __('ui.seo.offer.description', [
            'summary' => $base,
            'teacher' => $offer->user->name,
            'languages' => $languages !== '' ? $languages : __('ui.common.not_applicable'),
            'category' => $category ?: __('ui.common.not_applicable'),
        ]);
    }

    private function visibleMeetingUrl(TeachingOffer $offer, ?TeachingOfferApplication $application): ?string
    {
        if (! $offer->meeting_url) {
            return null;
        }

        if ($application?->status === TeachingOfferApplication::STATUS_ACCEPTED) {
            return $offer->meeting_url;
        }

        if ($offer->session_type === TeachingOffer::SESSION_OPEN_PUBLIC && ! $offer->is_accepting_applications) {
            return $offer->meeting_url;
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function offerIndexPayload(TeachingOffer $offer, ?array $reputation = null): array
    {
        $reputation ??= $this->reputations->forTeacher($offer->user);
        $profile = $offer->user->teacherProfile;

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
            'is_accepting_applications' => $offer->is_accepting_applications,
            'user' => [
                'id' => $offer->user->id,
                'name' => $offer->user->name,
                'avatar' => $offer->user->avatar,
                'city' => $profile?->show_location ? $offer->user->city : null,
                'country_code' => $profile?->show_location ? $offer->user->country_code : null,
                'profile_url' => $profile?->is_active ? route('teachers.show', $offer->user) : null,
                'rating_summary' => $this->publicRatingSummary($profile, $reputation),
                'reputation_summary' => $this->publicReputationSummary($profile, $reputation),
                'featured_badges' => $this->badgePayloads($offer->user, 2),
                'visible_badges_count' => $offer->user->teacherProfile?->show_badges ? $offer->user->userBadges->count() : 0,
            ],
            'category' => $offer->category,
            'subject' => $offer->subject,
            'languages' => $offer->languages,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function offerShowPayload(TeachingOffer $offer): array
    {
        $reputation = $this->reputations->forTeacher($offer->user);
        $profile = $offer->user->teacherProfile;

        return [
            ...$offer->only([
                'id',
                'slug',
                'title',
                'summary',
                'description',
                'level',
                'teaching_mode',
                'session_type',
                'max_students',
                'duration_minutes',
                'meeting_tool',
                'timezone',
                'availability_summary',
                'requirements',
                'materials_summary',
                'is_accepting_applications',
            ]),
            'user' => [
                'id' => $offer->user->id,
                'name' => $offer->user->name,
                'bio' => $offer->user->bio,
                'avatar' => $offer->user->avatar,
                'city' => $profile?->show_location ? $offer->user->city : null,
                'country_code' => $profile?->show_location ? $offer->user->country_code : null,
                'profile_url' => $profile?->is_active ? route('teachers.show', $offer->user) : null,
                'headline' => $offer->user->teacherProfile?->headline,
                'rating_summary' => $this->publicRatingSummary($profile, $reputation),
                'reputation_summary' => $this->publicReputationSummary($profile, $reputation),
                'featured_badges' => $this->badgePayloads($offer->user, 3),
                'visible_badges_count' => $offer->user->teacherProfile?->show_badges ? $offer->user->userBadges->count() : 0,
                'languages' => $offer->user->userLanguages->map(fn ($userLanguage): array => [
                    'id' => $userLanguage->language->id,
                    'code' => $userLanguage->language->code,
                    'name' => $userLanguage->language->name,
                    'native_name' => $userLanguage->language->native_name,
                ])->values(),
            ],
            'category' => $offer->category,
            'subject' => $offer->subject,
            'languages' => $offer->languages,
        ];
    }

    private function sortOffers($offers, array $reputationSummaries, string $sort)
    {
        if ($sort !== 'teacher_rating') {
            return $offers;
        }

        return $offers->sort(function (TeachingOffer $first, TeachingOffer $second) use ($reputationSummaries): int {
            $firstSummary = $reputationSummaries[$first->user_id] ?? [];
            $secondSummary = $reputationSummaries[$second->user_id] ?? [];
            $firstRating = $this->publicRatingSummary($first->user->teacherProfile, $firstSummary);
            $secondRating = $this->publicRatingSummary($second->user->teacherProfile, $secondSummary);

            return (($secondRating['average'] ?? -1) <=> ($firstRating['average'] ?? -1))
                ?: (($secondRating['count'] ?? 0) <=> ($firstRating['count'] ?? 0))
                ?: (($second->published_at?->timestamp ?? 0) <=> ($first->published_at?->timestamp ?? 0));
        });
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function badgePayloads(User $teacher, int $limit)
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

        return $badges
            ->where('is_featured', true)
            ->take($limit)
            ->map(fn ($badge): array => $badge->publicPayload())
            ->values();
    }

    /**
     * @param  array<string, mixed>  $reputation
     * @return array<string, mixed>|null
     */
    private function publicRatingSummary(?TeacherProfile $profile, array $reputation): ?array
    {
        if (! $profile?->show_reviews || ! $profile?->show_reputation_summary) {
            return null;
        }

        return [
            'average' => $reputation['average_rating'] ?? null,
            'count' => $reputation['published_review_count'] ?? 0,
        ];
    }

    /**
     * @param  array<string, mixed>  $reputation
     * @return array<string, mixed>|null
     */
    private function publicReputationSummary(?TeacherProfile $profile, array $reputation): ?array
    {
        if (! $profile?->show_reputation_summary) {
            return null;
        }

        $summary = $reputation;

        if (! $profile->show_reviews) {
            $summary['average_rating'] = null;
            $summary['published_review_count'] = 0;
        }

        if (! $profile->show_completed_sessions_count) {
            $summary['completed_sessions_count'] = 0;
        }

        if (! $profile->show_students_helped_count) {
            $summary['students_helped_count'] = 0;
        }

        if (! $profile->show_teaching_hours) {
            $summary['teaching_hours'] = 0;
        }

        return $summary;
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\ClassSessionAttendee;
use App\Models\Language;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicOfferController extends Controller
{
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
        ];

        $offers = TeachingOffer::query()
            ->publiclyVisible()
            ->with([
                'user:id,name,avatar_path,avatar_url,city,country_code',
                'user.teacherProfile:id,user_id,is_active',
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

        return Inertia::render('offers/index', [
            'offers' => $offers->map(fn (TeachingOffer $offer): array => $this->offerIndexPayload($offer))->values(),
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
        ]);
    }

    public function show(Request $request, TeachingOffer $offer): Response
    {
        abort_unless($offer->is_public && $offer->is_active && $offer->published_at !== null, 404);

        $offer->load([
            'user:id,name,avatar_path,avatar_url,bio,city,country_code',
            'user.teacherProfile:id,user_id,headline,teaching_bio,is_active,is_verified',
            'user.userLanguages' => fn ($query) => $query
                ->where('teaches', true)
                ->with('language:id,code,name,native_name'),
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
            'currentApplication' => $currentApplication?->only(['id', 'status']),
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
    private function offerIndexPayload(TeachingOffer $offer): array
    {
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
                'city' => $offer->user->city,
                'country_code' => $offer->user->country_code,
                'profile_url' => $offer->user->teacherProfile?->is_active ? route('teachers.show', $offer->user) : null,
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
                'city' => $offer->user->city,
                'country_code' => $offer->user->country_code,
                'profile_url' => $offer->user->teacherProfile?->is_active ? route('teachers.show', $offer->user) : null,
                'headline' => $offer->user->teacherProfile?->headline,
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
}

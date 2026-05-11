<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
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
            'accepting' => $request->boolean('accepting'),
        ];

        $offers = TeachingOffer::query()
            ->publiclyVisible()
            ->with([
                'user:id,name,email,avatar_path,avatar_url',
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
            ->when($filters['accepting'], fn ($query) => $query->where('is_accepting_applications', true))
            ->latest('published_at')
            ->get();

        return Inertia::render('offers/index', [
            'offers' => $offers,
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
            'levels' => TeachingOffer::LEVELS,
            'teachingModes' => TeachingOffer::MODES,
            'sessionTypes' => TeachingOffer::SESSION_TYPES,
        ]);
    }

    public function show(Request $request, TeachingOffer $offer): Response
    {
        abort_unless($offer->is_public && $offer->is_active && $offer->published_at !== null, 404);

        $offer->load([
            'user:id,name,email,avatar_path,avatar_url,bio',
            'category:id,name,slug,color',
            'subject:id,name,slug',
            'languages:id,code,name,native_name',
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
            'offer' => $offer,
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
}

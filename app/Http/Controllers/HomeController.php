<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\Language;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeachingOffer;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $locale = app()->getLocale();
        $currentLanguage = Language::query()
            ->where('code', $locale)
            ->first(['id', 'code', 'name', 'native_name'])
            ?? Language::query()->where('code', 'en')->first(['id', 'code', 'name', 'native_name']);

        $featuredOffers = $this->featuredOffers($locale);
        $openOffers = $this->openPublicOffers($locale);
        $featuredTeachers = $this->featuredTeachers();

        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'currentLanguage' => $currentLanguage,
            'featuredTeachers' => $featuredTeachers,
            'featuredOffers' => $featuredOffers,
            'openOffers' => $openOffers,
            'stats' => [
                'teachers' => TeacherProfile::query()->where('is_active', true)->count(),
                'students' => StudentProfile::query()->where('is_active', true)->count(),
                'offers' => TeachingOffer::query()->publiclyVisible()->count(),
                'languages' => Language::query()->where('is_active', true)->count(),
                'countries' => User::query()->whereNotNull('country_code')->distinct('country_code')->count('country_code'),
                'open_sessions' => ClassSession::query()
                    ->where('status', ClassSession::STATUS_SCHEDULED)
                    ->whereHas('offer', fn ($query) => $query
                        ->publiclyVisible()
                        ->where('session_type', TeachingOffer::SESSION_OPEN_PUBLIC))
                    ->count(),
            ],
            'languageOfferUrl' => route('offers.index', ['language' => $locale]),
            'allOffersUrl' => route('offers.index'),
            'startTeachingUrl' => $request->user()
                ? route('profile.teacher.edit')
                : route('register'),
        ]);
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function featuredOffers(string $locale)
    {
        $matchingOffers = TeachingOffer::query()
            ->publiclyVisible()
            ->with(['user:id,name,avatar_path,avatar_url,city,country_code', 'user.teacherProfile:id,user_id,is_active', 'category:id,name,slug,color', 'subject:id,name,slug', 'languages:id,code,name,native_name'])
            ->whereHas('languages', fn ($query) => $query->where('code', $locale))
            ->latest('published_at')
            ->limit(6)
            ->get();

        if ($matchingOffers->count() < 6) {
            $fallbackOffers = TeachingOffer::query()
                ->publiclyVisible()
                ->with(['user:id,name,avatar_path,avatar_url,city,country_code', 'user.teacherProfile:id,user_id,is_active', 'category:id,name,slug,color', 'subject:id,name,slug', 'languages:id,code,name,native_name'])
                ->whereNotIn('id', $matchingOffers->pluck('id'))
                ->latest('published_at')
                ->limit(6 - $matchingOffers->count())
                ->get();

            $matchingOffers = $matchingOffers->merge($fallbackOffers);
        }

        return $matchingOffers->map(fn (TeachingOffer $offer): array => $this->offerPayload($offer))->values();
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function openPublicOffers(string $locale)
    {
        $openOffers = TeachingOffer::query()
            ->publiclyVisible()
            ->with(['user:id,name,avatar_path,avatar_url,city,country_code', 'user.teacherProfile:id,user_id,is_active', 'category:id,name,slug,color', 'subject:id,name,slug', 'languages:id,code,name,native_name'])
            ->where('session_type', TeachingOffer::SESSION_OPEN_PUBLIC)
            ->whereHas('languages', fn ($query) => $query->where('code', $locale))
            ->latest('published_at')
            ->limit(3)
            ->get();

        if ($openOffers->count() < 3) {
            $fallbackOffers = TeachingOffer::query()
                ->publiclyVisible()
                ->with(['user:id,name,avatar_path,avatar_url,city,country_code', 'user.teacherProfile:id,user_id,is_active', 'category:id,name,slug,color', 'subject:id,name,slug', 'languages:id,code,name,native_name'])
                ->where('session_type', TeachingOffer::SESSION_OPEN_PUBLIC)
                ->whereNotIn('id', $openOffers->pluck('id'))
                ->latest('published_at')
                ->limit(3 - $openOffers->count())
                ->get();

            $openOffers = $openOffers->merge($fallbackOffers);
        }

        return $openOffers->map(fn (TeachingOffer $offer): array => $this->offerPayload($offer))->values();
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function featuredTeachers()
    {
        $teachers = User::query()
            ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
            ->with([
                'teacherProfile:id,user_id,headline,teaching_bio,is_verified,is_accepting_requests',
                'userLanguages' => fn ($query) => $query
                    ->where('teaches', true)
                    ->with('language:id,code,name,native_name'),
                'teachingOffers' => fn ($query) => $query
                    ->publiclyVisible()
                    ->with(['category:id,name,slug,color', 'subject:id,name,slug'])
                    ->latest('published_at'),
            ])
            ->withCount(['teachingOffers as active_offers_count' => fn ($query) => $query->publiclyVisible()])
            ->orderByDesc('active_offers_count')
            ->limit(6)
            ->get();

        return $teachers->map(function (User $teacher): array {
            /** @var Collection<int, TeachingOffer> $offers */
            $offers = $teacher->teachingOffers;

            return [
                'id' => $teacher->id,
                'name' => $teacher->name,
                'avatar' => $teacher->avatar,
                'initials' => $teacher->initials,
                'headline' => $teacher->teacherProfile?->headline,
                'city' => $teacher->city,
                'country_code' => $teacher->country_code,
                'is_verified' => (bool) $teacher->teacherProfile?->is_verified,
                'active_offers_count' => (int) $teacher->active_offers_count,
                'teaching_bio_excerpt' => str($teacher->teacherProfile?->teaching_bio ?? '')->limit(180)->toString(),
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
        })->values();
    }

    /**
     * @return array<string, mixed>
     */
    private function offerPayload(TeachingOffer $offer): array
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
            'teacher' => [
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
            'url' => route('offers.show', $offer),
        ];
    }
}

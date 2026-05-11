<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class WorldMapController extends Controller
{
    public function __invoke(): Response
    {
        $totalLocatedUsers = User::query()->whereNotNull('country_code')->count();

        $countries = User::query()
            ->whereNotNull('country_code')
            ->selectRaw('country_code, count(*) as users_count')
            ->groupBy('country_code')
            ->orderByDesc('users_count')
            ->get()
            ->map(function ($row): array {
                $countryCode = (string) $row->country_code;

                return [
                    'country_code' => $countryCode,
                    'users_count' => (int) $row->users_count,
                    'teachers_count' => User::query()
                        ->where('country_code', $countryCode)
                        ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
                        ->count(),
                    'students_count' => User::query()
                        ->where('country_code', $countryCode)
                        ->whereHas('studentProfile', fn ($query) => $query->where('is_active', true))
                        ->count(),
                    'mixed_users_count' => User::query()
                        ->where('country_code', $countryCode)
                        ->whereHas('studentProfile', fn ($query) => $query->where('is_active', true))
                        ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
                        ->count(),
                    'published_offers_count' => TeachingOffer::query()
                        ->whereNotNull('published_at')
                        ->whereHas('user', fn ($query) => $query->where('country_code', $countryCode))
                        ->count(),
                    'pending_applications_count' => TeachingOfferApplication::query()
                        ->where('status', TeachingOfferApplication::STATUS_PENDING)
                        ->whereHas('student', fn ($query) => $query->where('country_code', $countryCode))
                        ->count(),
                    'percentage' => $totalLocatedUsers > 0 ? round(((int) $row->users_count / $totalLocatedUsers) * 100, 1) : 0,
                ];
            });

        return Inertia::render('admin/world-map', [
            'countries' => $countries,
            'summary' => [
                'total_located_users' => $totalLocatedUsers,
                'countries_represented' => $countries->count(),
                'top_country_by_users' => $countries->sortByDesc('users_count')->first(),
                'top_country_by_teachers' => $countries->sortByDesc('teachers_count')->first(),
                'top_country_by_students' => $countries->sortByDesc('students_count')->first(),
            ],
        ]);
    }
}

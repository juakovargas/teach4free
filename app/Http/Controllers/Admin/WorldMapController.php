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
        $totalLocatedUsers = User::query()
            ->whereNotNull('country_code')
            ->where('country_code', '<>', '')
            ->count();

        $countries = User::query()
            ->whereNotNull('country_code')
            ->where('country_code', '<>', '')
            ->selectRaw('country_code, count(*) as users_count')
            ->groupBy('country_code')
            ->orderByDesc('users_count')
            ->get()
            ->map(function ($row) use ($totalLocatedUsers): array {
                $countryCode = (string) $row->country_code;
                $centroid = $this->countryCentroid($countryCode);
                $usersCount = (int) $row->users_count;
                $teachersCount = User::query()
                    ->where('country_code', $countryCode)
                    ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
                    ->count();
                $studentsCount = User::query()
                    ->where('country_code', $countryCode)
                    ->whereHas('studentProfile', fn ($query) => $query->where('is_active', true))
                    ->count();
                $mixedUsersCount = User::query()
                    ->where('country_code', $countryCode)
                    ->whereHas('studentProfile', fn ($query) => $query->where('is_active', true))
                    ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
                    ->count();
                $offersCount = TeachingOffer::query()
                    ->publiclyVisible()
                    ->whereHas('user', fn ($query) => $query->where('country_code', $countryCode))
                    ->count();

                return [
                    'country_code' => $countryCode,
                    'country_name' => $this->countryName($countryCode),
                    'latitude' => $centroid['latitude'] ?? null,
                    'longitude' => $centroid['longitude'] ?? null,
                    'total_users' => $usersCount,
                    'users_count' => $usersCount,
                    'teachers_count' => $teachersCount,
                    'students_count' => $studentsCount,
                    'mixed_users_count' => $mixedUsersCount,
                    'offers_count' => $offersCount,
                    'published_offers_count' => $offersCount,

                    'pending_applications_count' => TeachingOfferApplication::query()
                        ->where('status', TeachingOfferApplication::STATUS_PENDING)
                        ->whereHas('student', fn ($query) => $query->where('country_code', $countryCode))
                        ->count(),

                    'percentage' => $totalLocatedUsers > 0
                        ? round(($usersCount / $totalLocatedUsers) * 100, 1)
                        : 0,
                ];
            });

        return Inertia::render('admin/world-map', [
            'countries' => $countries,
            'summary' => [
                'total_located_users' => $totalLocatedUsers,
                'countries_represented' => $countries->count(),
                'top_country_by_users' => $countries->sortByDesc('total_users')->first(),
                'top_country_by_teachers' => $countries->sortByDesc('teachers_count')->first(),
                'top_country_by_students' => $countries->sortByDesc('students_count')->first(),
            ],
        ]);
    }

    /**
     * Approximate country centroids used only for aggregate admin map markers.
     *
     * These values are not user GPS coordinates and are not stored on profiles.
     *
     * @return array{latitude: float, longitude: float}|null
     */
    private function countryCentroid(string $countryCode): ?array
    {
        return [
            'AR' => ['latitude' => -38.4161, 'longitude' => -63.6167],
            'BR' => ['latitude' => -14.2350, 'longitude' => -51.9253],
            'CL' => ['latitude' => -35.6751, 'longitude' => -71.5430],
            'CO' => ['latitude' => 4.5709, 'longitude' => -74.2973],
            'DE' => ['latitude' => 51.1657, 'longitude' => 10.4515],
            'ES' => ['latitude' => 40.4637, 'longitude' => -3.7492],
            'FR' => ['latitude' => 46.2276, 'longitude' => 2.2137],
            'GB' => ['latitude' => 55.3781, 'longitude' => -3.4360],
            'IT' => ['latitude' => 41.8719, 'longitude' => 12.5674],
            'MX' => ['latitude' => 23.6345, 'longitude' => -102.5528],
            'PT' => ['latitude' => 39.3999, 'longitude' => -8.2245],
            'US' => ['latitude' => 37.0902, 'longitude' => -95.7129],
        ][strtoupper($countryCode)] ?? null;
    }

    private function countryName(string $countryCode): string
    {
        return [
            'AR' => 'Argentina',
            'BR' => 'Brazil',
            'CL' => 'Chile',
            'CO' => 'Colombia',
            'DE' => 'Germany',
            'ES' => 'Spain',
            'FR' => 'France',
            'GB' => 'United Kingdom',
            'IT' => 'Italy',
            'MX' => 'Mexico',
            'PT' => 'Portugal',
            'US' => 'United States',
        ][strtoupper($countryCode)] ?? strtoupper($countryCode);
    }
}

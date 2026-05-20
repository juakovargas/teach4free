<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherProfile;
use App\Models\TeachingOffer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:all,active,paused,verified,unverified'],
        ]);

        $teachers = User::query()
            ->whereHas('teacherProfile')
            ->with('teacherProfile:id,user_id,headline,is_active,is_verified,is_accepting_requests,activated_at,banner_path,show_badges,show_reviews,show_reputation_summary')
            ->withCount([
                'teachingOffers as public_offers_count' => fn ($query) => $query->publiclyVisible(),
                'teacherAvailabilities as availability_blocks_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                ->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('teacherProfile', fn ($query) => $query->where('headline', 'like', "%{$search}%"))))
            ->when(($filters['status'] ?? 'all') !== 'all', function ($query) use ($filters): void {
                match ($filters['status']) {
                    'active' => $query->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true)),
                    'paused' => $query->whereHas('teacherProfile', fn ($query) => $query->where('is_active', false)),
                    'verified' => $query->whereHas('teacherProfile', fn ($query) => $query->where('is_verified', true)),
                    'unverified' => $query->whereHas('teacherProfile', fn ($query) => $query->where('is_verified', false)),
                    default => null,
                };
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/teachers', [
            'teachers' => $teachers,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
            ],
            'summary' => [
                'total' => TeacherProfile::query()->count(),
                'active' => TeacherProfile::query()->where('is_active', true)->count(),
                'verified' => TeacherProfile::query()->where('is_verified', true)->count(),
                'public_offers' => TeachingOffer::query()->publiclyVisible()->count(),
            ],
        ]);
    }
}

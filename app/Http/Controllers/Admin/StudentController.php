<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use App\Models\TeachingOfferApplication;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:all,active,inactive'],
        ]);

        $students = User::query()
            ->whereHas('studentProfile')
            ->with('studentProfile:id,user_id,current_level,preferred_learning_mode,is_active')
            ->withCount([
                'learningApplications as applications_count',
                'learningApplications as pending_applications_count' => fn ($query) => $query->where('status', TeachingOfferApplication::STATUS_PENDING),
            ])
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                ->where(fn ($query) => $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")))
            ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query
                ->whereHas('studentProfile', fn ($query) => $query->where('is_active', $filters['status'] === 'active')))
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/students', [
            'students' => $students,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
            ],
            'summary' => [
                'total' => StudentProfile::query()->count(),
                'active' => StudentProfile::query()->where('is_active', true)->count(),
                'applications' => TeachingOfferApplication::query()->count(),
                'pending_applications' => TeachingOfferApplication::query()->where('status', TeachingOfferApplication::STATUS_PENDING)->count(),
            ],
        ]);
    }
}

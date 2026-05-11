<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', Rule::in(array_merge(['all'], ClassSession::STATUSES))],
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $sessions = ClassSession::query()
            ->with(['offer:id,title,slug', 'teacher:id,name,email,avatar_path,avatar_url,country_code'])
            ->withCount(['attendees as enrolled_attendees_count' => fn ($query) => $query->where('status', ClassSessionAttendee::STATUS_ENROLLED)])
            ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhereHas('teacher', fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('offer', fn ($query) => $query->where('title', 'like', "%{$search}%"));
                });
            })
            ->when($filters['date_from'] ?? null, fn ($query, string $date) => $query->whereDate('starts_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, string $date) => $query->whereDate('starts_at', '<=', $date))
            ->orderByDesc('starts_at')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/sessions/index', [
            'sessions' => $sessions,
            'filters' => [
                'status' => $filters['status'] ?? 'all',
                'search' => $filters['search'] ?? '',
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
            ],
        ]);
    }
}

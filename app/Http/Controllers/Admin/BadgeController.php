<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BadgeController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', Rule::in(['all', ...Badge::CATEGORIES])],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'inactive'])],
        ]);

        return Inertia::render('admin/badges/index', [
            'badges' => Badge::query()
                ->withCount([
                    'userBadges as awarded_count',
                    'userBadges as active_awarded_count' => fn ($query) => $query->whereNull('revoked_at'),
                    'userBadges as revoked_count' => fn ($query) => $query->whereNotNull('revoked_at'),
                ])
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                    ->where(fn ($query) => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('key', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")))
                ->when(($filters['category'] ?? 'all') !== 'all', fn ($query) => $query->where('category', $filters['category']))
                ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query->where('is_active', $filters['status'] === 'active'))
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? 'all',
                'status' => $filters['status'] ?? 'all',
            ],
            'categories' => Badge::CATEGORIES,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/badges/form', [
            'badge' => null,
            'categories' => Badge::CATEGORIES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['key'] = Str::slug($data['key'] ?: $data['name'], '_');

        Badge::create($data);

        return redirect()->route('admin.badges.index')->with('status', __('ui.admin_badges.created'));
    }

    public function edit(Badge $badge): Response
    {
        return Inertia::render('admin/badges/form', [
            'badge' => $badge,
            'categories' => Badge::CATEGORIES,
        ]);
    }

    public function update(Request $request, Badge $badge): RedirectResponse
    {
        $data = $this->validatedData($request, $badge);
        $data['key'] = Str::slug($data['key'] ?: $data['name'], '_');

        $badge->update($data);

        return redirect()->route('admin.badges.index')->with('status', __('ui.admin_badges.updated'));
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedData(Request $request, ?Badge $badge = null): array
    {
        return $request->validate([
            'key' => [
                'nullable',
                'string',
                'max:120',
                'regex:/^[a-z0-9_]+$/',
                Rule::unique('badges', 'key')->ignore($badge),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'icon' => ['nullable', 'string', 'max:80'],
            'color' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'category' => ['required', 'string', Rule::in(Badge::CATEGORIES)],
            'rule_type' => ['nullable', 'string', 'max:120'],
            'threshold' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'is_active' => ['required', 'boolean'],
            'is_public' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);
    }
}

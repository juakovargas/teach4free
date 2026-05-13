<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoryProposal;
use App\Models\TeachingCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryProposalController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', Rule::in(array_merge(['all'], CategoryProposal::STATUSES))],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        return Inertia::render('admin/category-proposals', [
            'proposals' => CategoryProposal::query()
                ->with(['proposer:id,name,email', 'reviewer:id,name,email', 'approvedCategory:id,name,slug,color'])
                ->withCount('subjectProposals')
                ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query->where('status', $filters['status']))
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                    ->where(fn ($query) => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'filters' => [
                'status' => $filters['status'] ?? 'all',
                'search' => $filters['search'] ?? '',
            ],
            'statuses' => CategoryProposal::STATUSES,
            'categories' => TeachingCategory::query()
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'color']),
        ]);
    }

    public function update(Request $request, CategoryProposal $proposal): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', 'string', Rule::in(['approve', 'reject', 'merge'])],
            'admin_notes' => ['nullable', 'string', 'max:4000'],
            'existing_category_id' => ['nullable', 'integer', Rule::exists('teaching_categories', 'id')],
        ]);

        $category = null;

        if ($data['action'] === 'approve') {
            $category = TeachingCategory::create([
                'name' => $proposal->name,
                'slug' => $this->uniqueSlug($proposal->name),
                'description' => $proposal->description,
                'color' => $proposal->suggested_color,
                'icon' => $proposal->suggested_icon,
                'is_active' => true,
                'sort_order' => (TeachingCategory::query()->max('sort_order') ?? 0) + 1,
            ]);
        }

        if ($data['action'] === 'merge') {
            $category = TeachingCategory::query()->findOrFail($data['existing_category_id']);
        }

        $proposal->forceFill([
            'status' => match ($data['action']) {
                'approve' => CategoryProposal::STATUS_APPROVED,
                'merge' => CategoryProposal::STATUS_MERGED,
                default => CategoryProposal::STATUS_REJECTED,
            },
            'admin_notes' => $data['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'approved_category_id' => $category?->id,
        ])->save();

        return back()->with('status', __('ui.admin_category_proposals.updated'));
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'category';
        $slug = $base;
        $counter = 2;

        while (TeachingCategory::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

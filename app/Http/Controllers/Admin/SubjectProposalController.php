<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CategoryProposal;
use App\Models\SubjectProposal;
use App\Models\TeachingCategory;
use App\Models\TeachingSubject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SubjectProposalController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', Rule::in(array_merge(['all'], SubjectProposal::STATUSES))],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        return Inertia::render('admin/subject-proposals', [
            'proposals' => SubjectProposal::query()
                ->with([
                    'proposer:id,name,email',
                    'reviewer:id,name,email',
                    'category:id,name,slug,color',
                    'categoryProposal:id,name,status,approved_category_id',
                    'approvedSubject:id,name,slug,teaching_category_id',
                ])
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
            'statuses' => SubjectProposal::STATUSES,
            'categories' => TeachingCategory::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'color']),
            'subjects' => TeachingSubject::query()
                ->with('category:id,name')
                ->orderBy('name')
                ->get(['id', 'teaching_category_id', 'name', 'slug']),
        ]);
    }

    public function update(Request $request, SubjectProposal $proposal): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', 'string', Rule::in(['approve', 'reject', 'merge'])],
            'admin_notes' => ['nullable', 'string', 'max:4000'],
            'teaching_category_id' => ['nullable', 'integer', Rule::exists('teaching_categories', 'id')],
            'existing_subject_id' => ['nullable', 'integer', Rule::exists('teaching_subjects', 'id')],
        ]);

        $subject = null;

        if ($data['action'] === 'approve') {
            $categoryId = $data['teaching_category_id']
                ?? $proposal->teaching_category_id
                ?? $proposal->categoryProposal?->approved_category_id;

            abort_unless($categoryId, 422);

            $subject = TeachingSubject::create([
                'teaching_category_id' => $categoryId,
                'name' => $proposal->name,
                'slug' => $this->uniqueSlug($proposal->name),
                'description' => $proposal->description,
                'is_active' => true,
                'sort_order' => (TeachingSubject::query()->where('teaching_category_id', $categoryId)->max('sort_order') ?? 0) + 1,
            ]);
        }

        if ($data['action'] === 'merge') {
            $subject = TeachingSubject::query()->findOrFail($data['existing_subject_id']);
        }

        $proposal->forceFill([
            'status' => match ($data['action']) {
                'approve' => SubjectProposal::STATUS_APPROVED,
                'merge' => SubjectProposal::STATUS_MERGED,
                default => SubjectProposal::STATUS_REJECTED,
            },
            'admin_notes' => $data['admin_notes'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'approved_subject_id' => $subject?->id,
        ])->save();

        return back()->with('status', __('ui.admin_subject_proposals.updated'));
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'subject';
        $slug = $base;
        $counter = 2;

        while (TeachingSubject::query()->where('slug', $slug)->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeachingCategory;
use App\Models\TeachingSubject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeachingSubjectController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'integer', Rule::exists('teaching_categories', 'id')],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'inactive'])],
        ]);

        return Inertia::render('admin/subjects/index', [
            'subjects' => TeachingSubject::query()
                ->with('category:id,name,slug,color')
                ->withCount('offers')
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                    ->where(fn ($query) => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")))
                ->when($filters['category'] ?? null, fn ($query, int $categoryId) => $query->where('teaching_category_id', $categoryId))
                ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query
                    ->where('is_active', $filters['status'] === 'active'))
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'categories' => $this->categories(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? '',
                'status' => $filters['status'] ?? 'all',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/subjects/form', [
            'subject' => null,
            'categories' => $this->categories(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['name']);

        TeachingSubject::create($data);

        return redirect()->route('admin.subjects.index')->with('status', __('ui.admin_subjects.created'));
    }

    public function edit(TeachingSubject $subject): Response
    {
        return Inertia::render('admin/subjects/form', [
            'subject' => $subject,
            'categories' => $this->categories(),
        ]);
    }

    public function update(Request $request, TeachingSubject $subject): RedirectResponse
    {
        $data = $this->validatedData($request, $subject);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['name'], $subject);

        $subject->update($data);

        return redirect()->route('admin.subjects.index')->with('status', __('ui.admin_subjects.updated'));
    }

    public function destroy(TeachingSubject $subject): RedirectResponse
    {
        $subject->forceFill(['is_active' => false])->save();

        return redirect()->route('admin.subjects.index')->with('status', __('ui.admin_subjects.deactivated'));
    }

    /**
     * @return array<int, array{id: int, name: string, slug: string}>
     */
    private function categories(): array
    {
        return TeachingCategory::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug'])
            ->all();
    }

    /**
     * @return array{teaching_category_id: int, name: string, slug: string|null, description: string|null, is_active: bool, sort_order: int}
     */
    private function validatedData(Request $request, ?TeachingSubject $subject = null): array
    {
        return $request->validate([
            'teaching_category_id' => ['required', 'integer', Rule::exists('teaching_categories', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('teaching_subjects', 'slug')->ignore($subject),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);
    }

    private function uniqueSlug(string $value, ?TeachingSubject $subject = null): string
    {
        $base = Str::slug($value) ?: 'subject';
        $slug = $base;
        $counter = 2;

        while (
            TeachingSubject::query()
                ->where('slug', $slug)
                ->when($subject, fn ($query) => $query->whereKeyNot($subject->id))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

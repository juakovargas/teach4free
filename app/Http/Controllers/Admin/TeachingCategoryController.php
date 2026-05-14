<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeachingCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeachingCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'inactive'])],
        ]);

        return Inertia::render('admin/categories/index', [
            'categories' => TeachingCategory::query()
                ->withCount(['subjects', 'offers'])
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                    ->where(fn ($query) => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")))
                ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query
                    ->where('is_active', $filters['status'] === 'active'))
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedData($request);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['name']);

        TeachingCategory::create($data);

        return redirect()->route('admin.categories.index')->with('status', __('ui.admin_categories.created'));
    }

    public function edit(TeachingCategory $category): Response
    {
        return Inertia::render('admin/categories/form', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, TeachingCategory $category): RedirectResponse
    {
        $data = $this->validatedData($request, $category);
        $data['slug'] = $this->uniqueSlug($data['slug'] ?: $data['name'], $category);

        $category->update($data);

        return redirect()->route('admin.categories.index')->with('status', __('ui.admin_categories.updated'));
    }

    public function destroy(TeachingCategory $category): RedirectResponse
    {
        $category->forceFill(['is_active' => false])->save();

        return redirect()->route('admin.categories.index')->with('status', __('ui.admin_categories.deactivated'));
    }

    /**
     * @return array{name: string, slug: string|null, description: string|null, color: string|null, icon: string|null, is_active: bool, sort_order: int}
     */
    private function validatedData(Request $request, ?TeachingCategory $category = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('teaching_categories', 'slug')->ignore($category),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'color' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'icon' => ['nullable', 'string', 'max:80'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);
    }

    private function uniqueSlug(string $value, ?TeachingCategory $category = null): string
    {
        $base = Str::slug($value) ?: 'category';
        $slug = $base;
        $counter = 2;

        while (
            TeachingCategory::query()
                ->where('slug', $slug)
                ->when($category, fn ($query) => $query->whereKeyNot($category->id))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}

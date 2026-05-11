<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Language;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LanguageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/languages/index', [
            'languages' => Language::query()
                ->withCount('userLanguages')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/languages/form', [
            'language' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Language::create($this->validatedData($request));

        return redirect()->route('admin.languages.index')->with('status', __('ui.admin_languages.created'));
    }

    public function edit(Language $language): Response
    {
        return Inertia::render('admin/languages/form', [
            'language' => $language,
        ]);
    }

    public function update(Request $request, Language $language): RedirectResponse
    {
        $language->update($this->validatedData($request, $language));

        return redirect()->route('admin.languages.index')->with('status', __('ui.admin_languages.updated'));
    }

    private function validatedData(Request $request, ?Language $language = null): array
    {
        return $request->validate([
            'code' => ['required', 'string', 'max:10', 'regex:/^[a-z]{2}(?:-[A-Z]{2})?$/', Rule::unique('languages', 'code')->ignore($language)],
            'name' => ['required', 'string', 'max:255'],
            'native_name' => ['required', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);
    }
}

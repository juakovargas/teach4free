<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PlaceholderController extends Controller
{
    public function __invoke(string $section): Response
    {
        abort_unless(array_key_exists($section, $this->sections()), 404);

        return Inertia::render('admin/placeholder', [
            'section' => $section,
            'titleKey' => "admin_sections.{$section}",
            'descriptionKey' => "admin_placeholders.{$section}",
        ]);
    }

    /**
     * @return array<string, true>
     */
    private function sections(): array
    {
        return [
            'users' => true,
            'teachers' => true,
            'students' => true,
            'languages' => true,
            'applications' => true,
            'sessions' => true,
            'reviews' => true,
            'reports' => true,
            'badges' => true,
            'content-pages' => true,
            'translations' => true,
            'platform-settings' => true,
        ];
    }
}

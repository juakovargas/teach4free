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
            'analytics' => true,
            'teachers' => true,
            'students' => true,
            'banned-users' => true,
            'verification-requests' => true,
            'open-sessions' => true,
            'waiting-lists' => true,
            'sessions' => true,
            'calendar-overview' => true,
            'notifications' => true,
            'email-log' => true,
            'reviews' => true,
            'reports' => true,
            'reviews-moderation' => true,
            'blocked-content' => true,
            'audit-log' => true,
            'badges' => true,
            'reputation-rules' => true,
            'content-pages' => true,
            'help-pages' => true,
            'translations' => true,
            'platform-settings' => true,
            'legal-pages' => true,
        ];
    }
}

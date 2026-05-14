<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ContentPageController extends Controller
{
    public function terms(): Response
    {
        return $this->render('terms');
    }

    public function privacy(): Response
    {
        return $this->render('privacy');
    }

    public function cookiePolicy(): Response
    {
        return $this->render('cookie_policy');
    }

    public function communityGuidelines(): Response
    {
        return $this->render('community_guidelines');
    }

    public function teacherGuidelines(): Response
    {
        return $this->render('teacher_guidelines');
    }

    public function freeLearningRules(): Response
    {
        return $this->render('free_learning_rules');
    }

    private function render(string $page): Response
    {
        $content = trans("ui.content_pages.{$page}");

        abort_unless(is_array($content), 404);

        return Inertia::render('content/show', [
            'pageKey' => $page,
            'content' => $content,
        ]);
    }
}

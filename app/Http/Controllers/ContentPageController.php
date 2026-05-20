<?php

namespace App\Http\Controllers;

use App\Services\SeoService;
use Inertia\Inertia;
use Inertia\Response;

class ContentPageController extends Controller
{
    public function __construct(private readonly SeoService $seo) {}

    public function about(): Response
    {
        $title = __('ui.seo.about.title');
        $description = __('ui.seo.about.description');

        return Inertia::render('about', [
            'seo' => $this->seo->metadata([
                'title' => $title,
                'description' => $description,
                'canonicalUrl' => route('about'),
                'ogType' => 'website',
                'structuredData' => [
                    $this->seo->webPageSchema('AboutPage', $title, $description, route('about')),
                ],
            ]),
        ]);
    }

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
            'seo' => $this->seo->metadata([
                'title' => $content['meta_title'] ?? $this->seo->defaultTitle(),
                'description' => $content['meta_description'] ?? ($content['intro'] ?? $this->seo->defaultDescription()),
                'canonicalUrl' => route(str_replace('_', '-', $page)),
                'ogType' => 'website',
                'structuredData' => [
                    $this->seo->webPageSchema(
                        'WebPage',
                        $content['title'] ?? ($content['meta_title'] ?? $this->seo->defaultTitle()),
                        $content['meta_description'] ?? ($content['intro'] ?? $this->seo->defaultDescription()),
                        route(str_replace('_', '-', $page)),
                    ),
                ],
            ]),
        ]);
    }
}

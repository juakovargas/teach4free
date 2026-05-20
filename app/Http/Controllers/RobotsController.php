<?php

namespace App\Http\Controllers;

use App\Services\SeoService;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __construct(private readonly SeoService $seo) {}

    public function __invoke(): Response
    {
        if (! $this->seo->searchIndexingEnabled()) {
            $lines = [
                'User-agent: *',
                'Disallow: /',
                'Sitemap: '.route('sitemap'),
            ];

            return response(implode("\n", $lines)."\n", 200, [
                'Content-Type' => 'text/plain; charset=UTF-8',
            ]);
        }

        $lines = [
            'User-agent: *',
            'Disallow: /admin/',
            'Disallow: /profile/',
            'Disallow: /settings/',
            'Disallow: /messages',
            'Disallow: /notifications',
            'Disallow: /my-applications',
            'Disallow: /my-sessions',
            'Disallow: /my-reports',
            'Disallow: /teacher/',
            'Disallow: /login',
            'Disallow: /register',
            'Disallow: /forgot-password',
            'Disallow: /reset-password',
            'Disallow: /email/verify',
            'Disallow: /auth/',
            'Allow: /',
            '',
            'Sitemap: '.route('sitemap'),
        ];

        return response(implode("\n", $lines)."\n", 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }
}

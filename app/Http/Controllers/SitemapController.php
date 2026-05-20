<?php

namespace App\Http\Controllers;

use App\Models\TeachingOffer;
use App\Models\User;
use App\Services\SeoService;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __construct(private readonly SeoService $seo) {}

    public function __invoke(): Response
    {
        abort_unless($this->seo->sitemapEnabled(), 404);

        $entries = collect([
            $this->entry(route('home'), null, 'daily', '1.0'),
            $this->entry(route('about'), null, 'monthly', '0.8'),
            $this->entry(route('offers.index'), null, 'daily', '0.9'),
            $this->entry(route('teachers.index'), null, 'daily', '0.9'),
            $this->entry(route('terms'), null, 'yearly', '0.4'),
            $this->entry(route('privacy'), null, 'yearly', '0.4'),
            $this->entry(route('cookie-policy'), null, 'yearly', '0.4'),
            $this->entry(route('community-guidelines'), null, 'yearly', '0.5'),
            $this->entry(route('teacher-guidelines'), null, 'yearly', '0.5'),
            $this->entry(route('free-learning-rules'), null, 'yearly', '0.5'),
        ]);

        TeachingOffer::query()
            ->publiclyVisible()
            ->latest('updated_at')
            ->get(['id', 'slug', 'updated_at'])
            ->each(fn (TeachingOffer $offer) => $entries->push(
                $this->entry(route('offers.show', $offer), $offer->updated_at, 'weekly', '0.7')
            ));

        User::query()
            ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
            ->with('teacherProfile:id,user_id,updated_at')
            ->latest('updated_at')
            ->get(['id', 'name', 'updated_at'])
            ->each(fn (User $teacher) => $entries->push(
                $this->entry(
                    route('teachers.show', $teacher),
                    $teacher->teacherProfile?->updated_at ?? $teacher->updated_at,
                    'weekly',
                    '0.7',
                )
            ));

        $xml = view('sitemap', [
            'entries' => $entries,
        ])->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /**
     * @return array{loc: string, lastmod: string|null, changefreq: string, priority: string}
     */
    private function entry(string $loc, mixed $lastmod, string $changefreq, string $priority): array
    {
        return [
            'loc' => $loc,
            'lastmod' => $lastmod?->toAtomString(),
            'changefreq' => $changefreq,
            'priority' => $priority,
        ];
    }
}

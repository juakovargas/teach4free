<?php

namespace App\Services;

use App\Models\PlatformSetting;
use App\Models\TeachingOffer;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class SeoService
{
    private ?PlatformSetting $settings = null;

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    public function metadata(array $overrides = []): array
    {
        $title = $overrides['title'] ?? $this->defaultTitle();
        $description = $this->excerpt($overrides['description'] ?? $this->defaultDescription(), 180);
        $canonicalUrl = $overrides['canonicalUrl'] ?? url()->current();
        $robots = $this->searchIndexingEnabled()
            ? ($overrides['robots'] ?? $this->defaultRobots())
            : 'noindex,nofollow';
        $ogImage = $this->absoluteImageUrl($overrides['ogImage'] ?? null) ?? $this->defaultOgImageUrl();
        $structuredData = $this->structuredDataEnabled()
            ? ($overrides['structuredData'] ?? null)
            : null;

        return [
            'title' => $title,
            'description' => $description,
            'canonicalUrl' => $this->absoluteUrl($canonicalUrl),
            'robots' => $robots,
            'ogTitle' => $overrides['ogTitle'] ?? $title,
            'ogDescription' => $overrides['ogDescription'] ?? $description,
            'ogType' => $overrides['ogType'] ?? 'website',
            'ogUrl' => $this->absoluteUrl($overrides['ogUrl'] ?? $canonicalUrl),
            'ogImage' => $ogImage,
            'ogSiteName' => $this->siteName(),
            'twitterCard' => $overrides['twitterCard'] ?? $this->twitterCard($ogImage),
            'twitterTitle' => $overrides['twitterTitle'] ?? ($overrides['ogTitle'] ?? $title),
            'twitterDescription' => $overrides['twitterDescription'] ?? ($overrides['ogDescription'] ?? $description),
            'twitterImage' => $this->absoluteImageUrl($overrides['twitterImage'] ?? null) ?? $ogImage,
            'structuredData' => $structuredData,
        ];
    }

    public function siteName(): string
    {
        return $this->stringSetting('seo_site_name')
            ?? config('seo.site_name', 'Teach4Free');
    }

    public function defaultTitle(): string
    {
        return $this->stringSetting('seo_default_meta_title')
            ?? __('ui.seo.default.title');
    }

    public function defaultDescription(): string
    {
        return $this->stringSetting('seo_default_meta_description')
            ?? __('ui.seo.default.description');
    }

    public function defaultRobots(): string
    {
        return $this->stringSetting('seo_default_robots')
            ?? config('seo.robots_default', 'index,follow');
    }

    public function sitemapEnabled(): bool
    {
        return $this->booleanSetting('seo_enable_sitemap', (bool) config('seo.enable_sitemap', true));
    }

    public function structuredDataEnabled(): bool
    {
        return $this->booleanSetting('seo_enable_structured_data', (bool) config('seo.enable_structured_data', true));
    }

    public function searchIndexingEnabled(): bool
    {
        return $this->booleanSetting('seo_search_indexing_enabled', (bool) config('seo.search_indexing_enabled', true));
    }

    public function defaultOgImageUrl(): ?string
    {
        return $this->absoluteImageUrl(
            $this->stringSetting('seo_default_og_image_path') ?? config('seo.default_og_image')
        );
    }

    public function publicDiskImageUrl(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        return $this->absoluteUrl(Storage::disk('public')->url($path));
    }

    public function userAvatarImageUrl(User $user): ?string
    {
        if ($user->avatar_path) {
            return $this->publicDiskImageUrl($user->avatar_path);
        }

        return $this->absoluteImageUrl($user->avatar_url);
    }

    public function teacherProfileImageUrl(User $teacher): ?string
    {
        $banner = $this->publicDiskImageUrl($teacher->teacherProfile?->banner_path);

        return $banner ?? $this->userAvatarImageUrl($teacher);
    }

    public function excerpt(?string $text, int $limit = 160): string
    {
        $clean = Str::of(strip_tags((string) $text))
            ->squish()
            ->toString();

        return Str::limit($clean, $limit, '');
    }

    /**
     * @return array<string, mixed>
     */
    public function organizationSchema(): array
    {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $this->siteName(),
            'url' => route('home'),
        ];

        if ($logo = $this->defaultOgImageUrl()) {
            $schema['logo'] = $logo;
        }

        return $schema;
    }

    /**
     * @return array<string, mixed>
     */
    public function websiteSchema(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $this->siteName(),
            'url' => route('home'),
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => route('offers.index').'?search={search_term_string}',
                'query-input' => 'required name=search_term_string',
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function webPageSchema(string $type, string $name, string $description, string $url): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => $type,
            'name' => $name,
            'description' => $description,
            'url' => $this->absoluteUrl($url),
            'isPartOf' => [
                '@type' => 'WebSite',
                'name' => $this->siteName(),
                'url' => route('home'),
            ],
        ];
    }

    /**
     * @param  iterable<int, string>  $languages
     * @param  iterable<int, string>  $subjects
     * @return array<string, mixed>
     */
    public function personSchema(User $teacher, string $description, ?string $imageUrl, iterable $languages, iterable $subjects): array
    {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Person',
            'name' => $teacher->name,
            'description' => $description,
            'url' => route('teachers.show', $teacher),
        ];

        if ($imageUrl) {
            $schema['image'] = $imageUrl;
        }

        $languageNames = collect($languages)->filter()->values();
        if ($languageNames->isNotEmpty()) {
            $schema['knowsLanguage'] = $languageNames->all();
        }

        $subjectNames = collect($subjects)->filter()->values();
        if ($subjectNames->isNotEmpty()) {
            $schema['knowsAbout'] = $subjectNames->all();
        }

        return $schema;
    }

    /**
     * @return array<string, mixed>
     */
    public function courseSchema(TeachingOffer $offer, string $description): array
    {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Course',
            'name' => $offer->title,
            'description' => $description,
            'url' => route('offers.show', $offer),
            'provider' => [
                '@type' => 'Person',
                'name' => $offer->user->name,
                'url' => $offer->user->teacherProfile?->is_active
                    ? route('teachers.show', $offer->user)
                    : route('home'),
            ],
        ];

        $languages = $offer->languages->pluck('code')->filter()->values();
        if ($languages->isNotEmpty()) {
            $schema['inLanguage'] = $languages->all();
        }

        if ($offer->level) {
            $schema['educationalLevel'] = $offer->level;
        }

        return $schema;
    }

    private function twitterCard(?string $imageUrl): string
    {
        if (! $imageUrl) {
            return 'summary';
        }

        return config('seo.twitter_card', 'summary_large_image');
    }

    private function absoluteImageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        $normalized = ltrim($path, '/');

        if (Str::startsWith($normalized, 'storage/')) {
            $relative = Str::after($normalized, 'storage/');

            return Storage::disk('public')->exists($relative)
                ? $this->absoluteUrl('/'.$normalized)
                : null;
        }

        if (Storage::disk('public')->exists($normalized)) {
            return $this->absoluteUrl(Storage::disk('public')->url($normalized));
        }

        if (is_file(public_path($normalized))) {
            return $this->absoluteUrl('/'.$normalized);
        }

        return null;
    }

    public function absoluteUrl(string $url): string
    {
        if (Str::startsWith($url, ['http://', 'https://'])) {
            return $url;
        }

        return url(Str::startsWith($url, '/') ? $url : '/'.$url);
    }

    private function stringSetting(string $key): ?string
    {
        $value = $this->settings()?->{$key};

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }

    private function booleanSetting(string $key, bool $default): bool
    {
        $settings = $this->settings();

        if (! $settings || ! array_key_exists($key, $settings->getAttributes())) {
            return $default;
        }

        return (bool) $settings->{$key};
    }

    private function settings(): ?PlatformSetting
    {
        if ($this->settings) {
            return $this->settings;
        }

        try {
            if (! Schema::hasTable('platform_settings')) {
                return null;
            }

            $this->settings = PlatformSetting::current();
        } catch (Throwable) {
            return null;
        }

        return $this->settings;
    }
}

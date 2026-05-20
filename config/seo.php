<?php

return [
    'site_name' => env('SEO_SITE_NAME', 'Teach4Free'),
    'default_title' => env('SEO_DEFAULT_TITLE', 'Teach4Free - Learn and teach for free'),
    'default_description' => env('SEO_DEFAULT_DESCRIPTION', 'A global community where people teach and learn online for free, without payments, credits or commissions.'),
    'default_og_image' => env('SEO_DEFAULT_OG_IMAGE'),
    'twitter_card' => env('SEO_TWITTER_CARD', 'summary_large_image'),
    'robots_default' => env('SEO_ROBOTS_DEFAULT', 'index,follow'),
    'enable_sitemap' => env('SEO_ENABLE_SITEMAP', true),
    'enable_structured_data' => env('SEO_ENABLE_STRUCTURED_DATA', true),
    'search_indexing_enabled' => env('SEO_SEARCH_INDEXING_ENABLED', true),
];

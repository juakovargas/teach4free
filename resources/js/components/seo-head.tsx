import { Head } from '@inertiajs/react';

export type StructuredData = Record<string, unknown> | Record<string, unknown>[];

export type SeoHeadProps = {
    title?: string | null;
    description?: string | null;
    canonicalUrl?: string | null;
    robots?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogType?: string | null;
    ogUrl?: string | null;
    ogImage?: string | null;
    ogSiteName?: string | null;
    twitterCard?: string | null;
    twitterTitle?: string | null;
    twitterDescription?: string | null;
    twitterImage?: string | null;
    structuredData?: StructuredData | null;
};

export function SeoHead({
    title,
    description,
    canonicalUrl,
    robots,
    ogTitle,
    ogDescription,
    ogType,
    ogUrl,
    ogImage,
    ogSiteName,
    twitterCard,
    twitterTitle,
    twitterDescription,
    twitterImage,
    structuredData,
}: SeoHeadProps) {
    const schemas = structuredData
        ? Array.isArray(structuredData)
            ? structuredData
            : [structuredData]
        : [];

    return (
        <Head title={title ?? undefined}>
            {description && <meta name="description" content={description} />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {robots && <meta name="robots" content={robots} />}

            {ogTitle && <meta property="og:title" content={ogTitle} />}
            {ogDescription && <meta property="og:description" content={ogDescription} />}
            {ogType && <meta property="og:type" content={ogType} />}
            {ogUrl && <meta property="og:url" content={ogUrl} />}
            {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}
            {ogImage && <meta property="og:image" content={ogImage} />}

            {twitterCard && <meta name="twitter:card" content={twitterCard} />}
            {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
            {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
            {twitterImage && <meta name="twitter:image" content={twitterImage} />}

            {schemas.map((schema, index) => (
                <script
                    key={`structured-data-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
                    }}
                />
            ))}
        </Head>
    );
}

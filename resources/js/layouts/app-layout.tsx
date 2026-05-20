import { Head } from '@inertiajs/react';

import { ConsentAwareTrackingScripts } from '@/components/consent-aware-tracking-scripts';
import { CookieConsentManager } from '@/components/cookie-consent-manager';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    return (
        <>
            <Head>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <ConsentAwareTrackingScripts />
            <CookieConsentManager />

            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
            </AppLayoutTemplate>
        </>
    );
}

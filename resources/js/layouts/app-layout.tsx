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
            <ConsentAwareTrackingScripts />
            <CookieConsentManager />

            <AppLayoutTemplate breadcrumbs={breadcrumbs}>
                {children}
            </AppLayoutTemplate>
        </>
    );
}
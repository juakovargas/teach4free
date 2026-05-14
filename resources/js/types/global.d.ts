import type { CookieConsentSharedProps } from '@/lib/cookie-consent';
import type { Auth } from '@/types/auth';

export type LocaleOption = {
    code: string;
    name: string;
};

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            locale: string;
            locales: LocaleOption[];
            translations: Record<string, unknown>;
            flash: {
                status?: string;
            };
            notifications: {
                unread_count: number;
                latest: {
                    id: string;
                    title: string;
                    message: string;
                    action_url?: string | null;
                    read_at?: string | null;
                    created_at?: string | null;
                }[];
            };
            messages: {
                unread_count: number;
            };
            admin_moderation: {
                open_incidents: number;
                open_conversation_reports: number;
                pending_moderation: number;
            };
            errors: Record<string, string>;
            sidebarOpen: boolean;
            cookieConsent: CookieConsentSharedProps;
            [key: string]: unknown;
        };
    }
}

export const COOKIE_CONSENT_COOKIE = 'teach4free_cookie_consent';
export const OPEN_COOKIE_PREFERENCES_EVENT = 'teach4free:open-cookie-preferences';
export const COOKIE_CONSENT_CHANGED_EVENT = 'teach4free:cookie-consent-changed';

export type CookieCategory = 'necessary' | 'preferences' | 'analytics' | 'marketing' | 'external_content';

export type CookieCategorySelection = Record<CookieCategory, boolean>;

export type CookieConsentAction = 'accepted_all' | 'rejected_non_essential' | 'customized';

export type CookieConsentRecord = {
    consentId: string;
    version: string;
    categories: CookieCategorySelection;
    action: CookieConsentAction;
    createdAt: string;
    expiresAt: string;
};

export type CookieConsentSettings = {
    banner_enabled: boolean;
    consent_required_regions: string;
    consent_duration_days: number;
    consent_version: string;
    show_reject_button: boolean;
    show_configure_button: boolean;
    block_analytics_until_consent: boolean;
    block_marketing_until_consent: boolean;
    block_external_content_until_consent: boolean;
    banner_style: 'modal_center' | 'bottom_banner' | string;
    cookie_policy_url: string;
};

export type CookieConsentTrackingSettings = {
    tracking_enabled: boolean;
    cookie_consent_required: boolean;
    google_analytics_id: string | null;
    google_tag_manager_id: string | null;
    meta_pixel_id: string | null;
    tiktok_pixel_id: string | null;
    linkedin_partner_id: string | null;
    microsoft_clarity_id: string | null;
    plausible_domain: string | null;
    custom_head_script: string | null;
    custom_body_script: string | null;
};

export type CookieConsentSharedProps = {
    required: boolean;
    detected_country_code: string | null;
    settings: CookieConsentSettings;
    tracking: CookieConsentTrackingSettings;
};

export const optionalCookieCategories: Exclude<CookieCategory, 'necessary'>[] = [
    'preferences',
    'analytics',
    'marketing',
    'external_content',
];

export function defaultCookieCategories(): CookieCategorySelection {
    return {
        necessary: true,
        preferences: false,
        analytics: false,
        marketing: false,
        external_content: false,
    };
}

export function allCookieCategories(): CookieCategorySelection {
    return {
        necessary: true,
        preferences: true,
        analytics: true,
        marketing: true,
        external_content: true,
    };
}

export function readCookieConsent(settings: CookieConsentSettings): CookieConsentRecord | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const rawCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_CONSENT_COOKIE}=`))
        ?.split('=')[1];

    if (!rawCookie) {
        removeLocalConsentMirror();

        return null;
    }

    const record = parseConsent(rawCookie);

    if (!isValidConsent(record, settings)) {
        clearCookieConsent();

        return null;
    }

    mirrorConsentToLocalStorage(record);

    return record;
}

export function storeCookieConsent(
    categories: CookieCategorySelection,
    settings: CookieConsentSettings,
    action: CookieConsentAction,
): CookieConsentRecord {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + settings.consent_duration_days * 24 * 60 * 60 * 1000);
    const record: CookieConsentRecord = {
        consentId: createConsentId(),
        version: settings.consent_version,
        categories: {
            ...categories,
            necessary: true,
        },
        action,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };

    writeConsentCookie(record, settings.consent_duration_days);
    mirrorConsentToLocalStorage(record);
    dispatchConsentChanged(record);

    return record;
}

export function clearCookieConsent(): void {
    if (typeof document !== 'undefined') {
        document.cookie = `${COOKIE_CONSENT_COOKIE}=;path=/;max-age=0;SameSite=Lax`;
    }

    removeLocalConsentMirror();
    dispatchConsentChanged(null);
}

export function hasCookieCategoryConsent(record: CookieConsentRecord | null, category: CookieCategory): boolean {
    if (category === 'necessary') {
        return true;
    }

    return record?.categories[category] === true;
}

export function openCookiePreferences(): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}

function parseConsent(rawCookie: string): CookieConsentRecord | null {
    try {
        const parsed = JSON.parse(decodeURIComponent(rawCookie)) as CookieConsentRecord;

        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
        return null;
    }
}

function isValidConsent(record: CookieConsentRecord | null, settings: CookieConsentSettings): record is CookieConsentRecord {
    if (!record || record.version !== settings.consent_version || !record.expiresAt) {
        return false;
    }

    if (Number.isNaN(Date.parse(record.expiresAt)) || new Date(record.expiresAt).getTime() <= Date.now()) {
        return false;
    }

    return record.categories?.necessary === true;
}

function writeConsentCookie(record: CookieConsentRecord, days: number): void {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    const secure = window.location.protocol === 'https:' ? ';Secure' : '';

    document.cookie = `${COOKIE_CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(record))};path=/;max-age=${maxAge};SameSite=Lax${secure}`;
}

function mirrorConsentToLocalStorage(record: CookieConsentRecord): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(COOKIE_CONSENT_COOKIE, JSON.stringify(record));
}

function removeLocalConsentMirror(): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.removeItem(COOKIE_CONSENT_COOKIE);
}

function dispatchConsentChanged(record: CookieConsentRecord | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT, { detail: record }));
}

function createConsentId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `consent-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

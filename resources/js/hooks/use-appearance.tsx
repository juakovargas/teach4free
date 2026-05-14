import { useSyncExternalStore } from 'react';
import {
    COOKIE_CONSENT_CHANGED_EVENT,
    COOKIE_CONSENT_COOKIE,
} from '@/lib/cookie-consent';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';

const prefersDark = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const clearCookie = (name: string): void => {
    if (typeof document === 'undefined') {
        return;
    }

    document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
};

const canStoreAppearancePreference = (): boolean => {
    if (typeof document === 'undefined') {
        return false;
    }

    const rawCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_CONSENT_COOKIE}=`))
        ?.split('=')[1];

    if (!rawCookie) {
        return false;
    }

    try {
        const consent = JSON.parse(decodeURIComponent(rawCookie)) as {
            expiresAt?: string;
            categories?: { preferences?: boolean };
        };

        return consent.categories?.preferences === true
            && typeof consent.expiresAt === 'string'
            && new Date(consent.expiresAt).getTime() > Date.now();
    } catch {
        return false;
    }
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    if (!canStoreAppearancePreference()) {
        return 'system';
    }

    return (localStorage.getItem('appearance') as Appearance) || 'system';
};

const isDarkMode = (appearance: Appearance): boolean => {
    return appearance === 'dark' || (appearance === 'system' && prefersDark());
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = (): void => applyTheme(currentAppearance);

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    currentAppearance = getStoredAppearance();
    applyTheme(currentAppearance);

    // Set up system theme change listener
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, () => {
        if (canStoreAppearancePreference()) {
            localStorage.setItem('appearance', currentAppearance);
            setCookie('appearance', currentAppearance);

            return;
        }

        localStorage.removeItem('appearance');
        clearCookie('appearance');
    });
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const resolvedAppearance: ResolvedAppearance = isDarkMode(appearance)
        ? 'dark'
        : 'light';

    const updateAppearance = (mode: Appearance): void => {
        currentAppearance = mode;

        if (canStoreAppearancePreference()) {
            localStorage.setItem('appearance', mode);
            setCookie('appearance', mode);
        } else {
            localStorage.removeItem('appearance');
            clearCookie('appearance');
        }

        applyTheme(mode);
        notify();
    };

    return { appearance, resolvedAppearance, updateAppearance } as const;
}

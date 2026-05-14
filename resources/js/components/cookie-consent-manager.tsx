import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, Cookie, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/use-translation';
import {
    allCookieCategories,
    defaultCookieCategories,
    optionalCookieCategories,
    readCookieConsent,
    storeCookieConsent,
} from '@/lib/cookie-consent';
import type {
    CookieCategory,
    CookieCategorySelection,
    CookieConsentRecord,
    CookieConsentSharedProps,
} from '@/lib/cookie-consent';
import { cn } from '@/lib/utils';

type PageProps = {
    cookieConsent?: CookieConsentSharedProps;
};

export function CookieConsentManager() {
    const { cookieConsent } = usePage().props as PageProps;
    const { t } = useTranslation();
    const settings = cookieConsent?.settings;
    const [storedConsent, setStoredConsent] = useState<CookieConsentRecord | null>(() => {
        return settings ? readCookieConsent(settings) : null;
    });
    const [forcedOpen, setForcedOpen] = useState(false);
    const [view, setView] = useState<'summary' | 'configure'>('summary');
    const [selection, setSelection] = useState<CookieCategorySelection>(() => storedConsent?.categories ?? defaultCookieCategories());

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const openPreferences = () => {
            const currentConsent = settings ? readCookieConsent(settings) : null;
            setStoredConsent(currentConsent);
            setSelection(currentConsent?.categories ?? defaultCookieCategories());
            setView('configure');
            setForcedOpen(true);
        };

        window.addEventListener('teach4free:open-cookie-preferences', openPreferences);

        return () => window.removeEventListener('teach4free:open-cookie-preferences', openPreferences);
    }, [settings]);

    if (!cookieConsent || !settings) {
        return null;
    }

    const validStoredConsent = storedConsent?.version === settings.consent_version ? storedConsent : null;
    const shouldOpen = forcedOpen || (cookieConsent.required && settings.banner_enabled && !validStoredConsent);

    if (!shouldOpen) {
        return null;
    }

    const acceptAll = () => {
        const record = storeCookieConsent(allCookieCategories(), settings, 'accepted_all');
        setStoredConsent(record);
        setSelection(record.categories);
        setForcedOpen(false);
        setView('summary');
    };

    const rejectNonEssential = () => {
        const record = storeCookieConsent(defaultCookieCategories(), settings, 'rejected_non_essential');
        setStoredConsent(record);
        setSelection(record.categories);
        setForcedOpen(false);
        setView('summary');
    };

    const savePreferences = () => {
        const record = storeCookieConsent(selection, settings, 'customized');
        setStoredConsent(record);
        setSelection(record.categories);
        setForcedOpen(false);
        setView('summary');
    };

    const toggleCategory = (category: Exclude<CookieCategory, 'necessary'>, checked: boolean) => {
        setSelection((current) => ({
            ...current,
            [category]: checked,
            necessary: true,
        }));
    };

    const content = (
        <div
            aria-modal={settings.banner_style === 'modal_center' ? true : undefined}
            className={cn(
                'w-full rounded-lg border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
                settings.banner_style === 'bottom_banner' ? 'max-w-5xl' : 'max-w-2xl',
            )}
            role="dialog"
            aria-labelledby="cookie-consent-title"
        >
            <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                    <Cookie className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p id="cookie-consent-title" className="text-lg font-semibold">
                        {t('cookie_consent.title')}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {t('cookie_consent.intro')}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                        <Link href={settings.cookie_policy_url} className="font-medium text-emerald-700 underline underline-offset-4 dark:text-emerald-300">
                            {t('cookie_consent.cookie_policy')}
                        </Link>
                    </p>
                </div>
            </div>

            {view === 'summary' ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Button type="button" onClick={acceptAll}>
                        {t('cookie_consent.accept_all')}
                    </Button>
                    {settings.show_reject_button && (
                        <Button type="button" variant="outline" onClick={rejectNonEssential}>
                            {t('cookie_consent.reject_non_essential')}
                        </Button>
                    )}
                    {settings.show_configure_button && (
                        <Button type="button" variant="outline" onClick={() => setView('configure')}>
                            {t('cookie_consent.configure')}
                        </Button>
                    )}
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    <div className="grid gap-3">
                        <CategoryRow
                            title={t('cookie_categories.necessary.name')}
                            description={t('cookie_categories.necessary.description')}
                            checked={true}
                            disabled={true}
                            onChange={() => undefined}
                        />
                        {optionalCookieCategories.map((category) => (
                            <CategoryRow
                                key={category}
                                title={t(`cookie_categories.${category}.name`)}
                                description={t(`cookie_categories.${category}.description`)}
                                checked={selection[category]}
                                onChange={(checked) => toggleCategory(category, checked)}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Button type="button" variant="ghost" onClick={() => setView('summary')}>
                            <ChevronLeft />
                            {t('cookie_consent.back')}
                        </Button>
                        <div className="grid gap-2 sm:flex">
                            <Button type="button" variant="outline" onClick={rejectNonEssential}>
                                {t('cookie_consent.reject_non_essential')}
                            </Button>
                            <Button type="button" variant="outline" onClick={acceptAll}>
                                {t('cookie_consent.accept_all')}
                            </Button>
                            <Button type="button" onClick={savePreferences}>
                                {t('cookie_consent.save_preferences')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 flex gap-2 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-muted-foreground dark:bg-slate-950">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
                <p>{t('cookie_consent.no_payment_note')}</p>
            </div>
        </div>
    );

    if (settings.banner_style === 'bottom_banner') {
        return (
            <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/80 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
                <div className="mx-auto max-w-6xl">{content}</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
            {content}
        </div>
    );
}

function CategoryRow({
    title,
    description,
    checked,
    disabled = false,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <span>
                <span className="font-medium">{title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{description}</span>
            </span>
            <Checkbox
                checked={checked}
                disabled={disabled}
                onCheckedChange={(value) => onChange(value === true)}
                aria-label={title}
            />
        </label>
    );
}

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Cookie, Save, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type CookieSettings = {
    banner_enabled: boolean;
    consent_required_regions: string;
    custom_required_country_codes: string | null;
    consent_duration_days: number;
    consent_version: string;
    show_reject_button: boolean;
    show_configure_button: boolean;
    block_analytics_until_consent: boolean;
    block_marketing_until_consent: boolean;
    block_external_content_until_consent: boolean;
    banner_style: string;
    updater?: { name: string; email: string } | null;
    updated_at?: string | null;
};

type Props = {
    settings: CookieSettings;
    options: {
        region_modes: string[];
        durations: number[];
        banner_styles: string[];
    };
};

export default function AdminCookieSettings({ settings, options }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        banner_enabled: settings.banner_enabled,
        consent_required_regions: settings.consent_required_regions,
        custom_required_country_codes: settings.custom_required_country_codes ?? '',
        consent_duration_days: settings.consent_duration_days,
        consent_version: settings.consent_version,
        show_reject_button: settings.show_reject_button,
        show_configure_button: settings.show_configure_button,
        block_analytics_until_consent: settings.block_analytics_until_consent,
        block_marketing_until_consent: settings.block_marketing_until_consent,
        block_external_content_until_consent: settings.block_external_content_until_consent,
        banner_style: settings.banner_style,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/admin/cookie-settings', { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_cookie_settings.meta_title')} />
            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Cookie className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_cookie_settings.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_cookie_settings.intro')}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/analytics">{t('admin_cookie_settings.analytics_link')}</Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/cookie-policy">{t('admin_cookie_settings.policy_link')}</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                        <Toggle label={t('admin_cookie_settings.banner_enabled')} checked={form.data.banner_enabled} onChange={(value) => form.setData('banner_enabled', value)} />
                        <Toggle label={t('admin_cookie_settings.show_reject_button')} checked={form.data.show_reject_button} onChange={(value) => form.setData('show_reject_button', value)} />
                        <Toggle label={t('admin_cookie_settings.show_configure_button')} checked={form.data.show_configure_button} onChange={(value) => form.setData('show_configure_button', value)} />
                    </div>

                    <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                        <Toggle label={t('admin_cookie_settings.block_analytics_until_consent')} checked={form.data.block_analytics_until_consent} onChange={(value) => form.setData('block_analytics_until_consent', value)} />
                        <Toggle label={t('admin_cookie_settings.block_marketing_until_consent')} checked={form.data.block_marketing_until_consent} onChange={(value) => form.setData('block_marketing_until_consent', value)} />
                        <Toggle label={t('admin_cookie_settings.block_external_content_until_consent')} checked={form.data.block_external_content_until_consent} onChange={(value) => form.setData('block_external_content_until_consent', value)} />
                    </div>

                    <SelectField
                        label={t('admin_cookie_settings.consent_required_regions')}
                        value={form.data.consent_required_regions}
                        options={options.region_modes}
                        translationPrefix="cookie_region_modes"
                        onChange={(value) => form.setData('consent_required_regions', value)}
                        error={form.errors.consent_required_regions}
                    />

                    <SelectField
                        label={t('admin_cookie_settings.consent_duration_days')}
                        value={String(form.data.consent_duration_days)}
                        options={options.durations.map(String)}
                        translationPrefix="cookie_durations"
                        onChange={(value) => form.setData('consent_duration_days', Number(value))}
                        error={form.errors.consent_duration_days}
                    />

                    <Field label={t('admin_cookie_settings.consent_version')} value={form.data.consent_version} onChange={(value) => form.setData('consent_version', value)} error={form.errors.consent_version} />

                    <SelectField
                        label={t('admin_cookie_settings.banner_style')}
                        value={form.data.banner_style}
                        options={options.banner_styles}
                        translationPrefix="cookie_banner_styles"
                        onChange={(value) => form.setData('banner_style', value)}
                        error={form.errors.banner_style}
                    />

                    <div className="space-y-2 md:col-span-2">
                        <Label>{t('admin_cookie_settings.custom_required_country_codes')}</Label>
                        <Textarea
                            value={form.data.custom_required_country_codes}
                            onChange={(event) => form.setData('custom_required_country_codes', event.target.value)}
                            rows={3}
                            placeholder={t('admin_cookie_settings.custom_required_country_codes_placeholder')}
                        />
                        <p className="text-xs leading-5 text-muted-foreground">{t('admin_cookie_settings.custom_required_country_codes_help')}</p>
                        <InputError message={form.errors.custom_required_country_codes} />
                    </div>
                </section>

                <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                        <p>{t('admin_cookie_settings.privacy_note')}</p>
                    </div>
                </section>

                <ContextualHelp title={t('admin_cookie_settings.help_title')}>
                    {t('admin_cookie_settings.help_body')}
                </ContextualHelp>

                <Button disabled={form.processing}>
                    <Save />
                    {t('actions.save')}
                </Button>
            </form>
        </>
    );
}

function Field({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input value={value} onChange={(event) => onChange(event.target.value)} />
            <InputError message={error} />
        </div>
    );
}

function SelectField({
    label,
    value,
    options,
    translationPrefix,
    onChange,
    error,
}: {
    label: string;
    value: string;
    options: string[];
    translationPrefix: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option} value={option}>
                            {t(`${translationPrefix}.${option}`)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
            {label}
        </label>
    );
}

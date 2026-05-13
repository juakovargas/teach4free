import { Head, useForm, usePage } from '@inertiajs/react';
import { BarChart3, Save, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type TrackingSettings = {
    google_analytics_id: string | null;
    google_tag_manager_id: string | null;
    meta_pixel_id: string | null;
    tiktok_pixel_id: string | null;
    linkedin_partner_id: string | null;
    microsoft_clarity_id: string | null;
    plausible_domain: string | null;
    custom_head_script: string | null;
    custom_body_script: string | null;
    tracking_enabled: boolean;
    cookie_consent_required: boolean;
    updater?: { name: string; email: string } | null;
    updated_at?: string | null;
};

type Props = {
    settings: TrackingSettings;
};

export default function AdminAnalytics({ settings }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        google_analytics_id: settings.google_analytics_id ?? '',
        google_tag_manager_id: settings.google_tag_manager_id ?? '',
        meta_pixel_id: settings.meta_pixel_id ?? '',
        tiktok_pixel_id: settings.tiktok_pixel_id ?? '',
        linkedin_partner_id: settings.linkedin_partner_id ?? '',
        microsoft_clarity_id: settings.microsoft_clarity_id ?? '',
        plausible_domain: settings.plausible_domain ?? '',
        custom_head_script: settings.custom_head_script ?? '',
        custom_body_script: settings.custom_body_script ?? '',
        tracking_enabled: settings.tracking_enabled,
        cookie_consent_required: settings.cookie_consent_required,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/admin/analytics', { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_analytics.meta_title')} />
            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <BarChart3 className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_analytics.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_analytics.intro')}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant={form.data.tracking_enabled ? 'default' : 'outline'}>
                                    {form.data.tracking_enabled ? t('admin_analytics.enabled') : t('admin_analytics.disabled')}
                                </Badge>
                                <Badge variant="outline">
                                    {form.data.cookie_consent_required ? t('admin_analytics.consent_required') : t('admin_analytics.consent_not_required')}
                                </Badge>
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
                    <TextField label={t('admin_analytics.google_analytics_id')} value={form.data.google_analytics_id} onChange={(value) => form.setData('google_analytics_id', value)} error={form.errors.google_analytics_id} />
                    <TextField label={t('admin_analytics.google_tag_manager_id')} value={form.data.google_tag_manager_id} onChange={(value) => form.setData('google_tag_manager_id', value)} error={form.errors.google_tag_manager_id} />
                    <TextField label={t('admin_analytics.meta_pixel_id')} value={form.data.meta_pixel_id} onChange={(value) => form.setData('meta_pixel_id', value)} error={form.errors.meta_pixel_id} />
                    <TextField label={t('admin_analytics.tiktok_pixel_id')} value={form.data.tiktok_pixel_id} onChange={(value) => form.setData('tiktok_pixel_id', value)} error={form.errors.tiktok_pixel_id} />
                    <TextField label={t('admin_analytics.linkedin_partner_id')} value={form.data.linkedin_partner_id} onChange={(value) => form.setData('linkedin_partner_id', value)} error={form.errors.linkedin_partner_id} />
                    <TextField label={t('admin_analytics.microsoft_clarity_id')} value={form.data.microsoft_clarity_id} onChange={(value) => form.setData('microsoft_clarity_id', value)} error={form.errors.microsoft_clarity_id} />
                    <TextField label={t('admin_analytics.plausible_domain')} value={form.data.plausible_domain} onChange={(value) => form.setData('plausible_domain', value)} error={form.errors.plausible_domain} />
                    <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                        <Toggle label={t('admin_analytics.tracking_enabled')} checked={form.data.tracking_enabled} onChange={(value) => form.setData('tracking_enabled', value)} />
                        <Toggle label={t('admin_analytics.cookie_consent_required')} checked={form.data.cookie_consent_required} onChange={(value) => form.setData('cookie_consent_required', value)} />
                    </div>
                    <ScriptField label={t('admin_analytics.custom_head_script')} value={form.data.custom_head_script} onChange={(value) => form.setData('custom_head_script', value)} error={form.errors.custom_head_script} />
                    <ScriptField label={t('admin_analytics.custom_body_script')} value={form.data.custom_body_script} onChange={(value) => form.setData('custom_body_script', value)} error={form.errors.custom_body_script} />
                </section>

                <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                    <div className="flex gap-3">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0" />
                        <p>{t('admin_analytics.activation_note')}</p>
                    </div>
                </section>

                <ContextualHelp title={t('admin_analytics.help_title')}>
                    {t('admin_analytics.help_body')}
                </ContextualHelp>

                <Button disabled={form.processing}>
                    <Save />
                    {t('actions.save')}
                </Button>
            </form>
        </>
    );
}

function TextField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input value={value} onChange={(event) => onChange(event.target.value)} />
            <InputError message={error} />
        </div>
    );
}

function ScriptField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) {
    return (
        <div className="space-y-2 md:col-span-2">
            <Label>{label}</Label>
            <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={6} />
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

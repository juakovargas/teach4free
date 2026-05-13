import { Head, useForm, usePage } from '@inertiajs/react';
import { Save, Settings } from 'lucide-react';
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

type SettingsData = {
    platform_name: string;
    support_email: string | null;
    default_locale: string;
    allow_teacher_category_proposals: boolean;
    allow_teacher_subject_proposals: boolean;
    require_email_verification: boolean;
    allow_public_teacher_profiles: boolean;
    allow_open_public_sessions: boolean;
    maintenance_notice: string | null;
};

type Props = {
    settings: SettingsData;
    supportedLocales: string[];
};

export default function AdminPlatformSettings({ settings, supportedLocales }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        platform_name: settings.platform_name,
        support_email: settings.support_email ?? '',
        default_locale: settings.default_locale,
        allow_teacher_category_proposals: settings.allow_teacher_category_proposals,
        allow_teacher_subject_proposals: settings.allow_teacher_subject_proposals,
        require_email_verification: settings.require_email_verification,
        allow_public_teacher_profiles: settings.allow_public_teacher_profiles,
        allow_open_public_sessions: settings.allow_open_public_sessions,
        maintenance_notice: settings.maintenance_notice ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/admin/platform-settings', { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_platform_settings.meta_title')} />
            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Settings className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_platform_settings.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_platform_settings.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <Field label={t('admin_platform_settings.platform_name')} value={form.data.platform_name} onChange={(value) => form.setData('platform_name', value)} error={form.errors.platform_name} />
                    <Field label={t('admin_platform_settings.support_email')} value={form.data.support_email} onChange={(value) => form.setData('support_email', value)} error={form.errors.support_email} />
                    <div className="space-y-2">
                        <Label>{t('admin_platform_settings.default_locale')}</Label>
                        <Select value={form.data.default_locale} onValueChange={(value) => form.setData('default_locale', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {supportedLocales.map((locale) => (
                                    <SelectItem key={locale} value={locale}>{locale.toUpperCase()}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.default_locale} />
                    </div>
                    <div className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                        <Toggle label={t('admin_platform_settings.allow_teacher_category_proposals')} checked={form.data.allow_teacher_category_proposals} onChange={(value) => form.setData('allow_teacher_category_proposals', value)} />
                        <Toggle label={t('admin_platform_settings.allow_teacher_subject_proposals')} checked={form.data.allow_teacher_subject_proposals} onChange={(value) => form.setData('allow_teacher_subject_proposals', value)} />
                        <Toggle label={t('admin_platform_settings.require_email_verification')} checked={form.data.require_email_verification} onChange={(value) => form.setData('require_email_verification', value)} />
                        <Toggle label={t('admin_platform_settings.allow_public_teacher_profiles')} checked={form.data.allow_public_teacher_profiles} onChange={(value) => form.setData('allow_public_teacher_profiles', value)} />
                        <Toggle label={t('admin_platform_settings.allow_open_public_sessions')} checked={form.data.allow_open_public_sessions} onChange={(value) => form.setData('allow_open_public_sessions', value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>{t('admin_platform_settings.maintenance_notice')}</Label>
                        <Textarea value={form.data.maintenance_notice} onChange={(event) => form.setData('maintenance_notice', event.target.value)} />
                        <InputError message={form.errors.maintenance_notice} />
                    </div>
                </section>

                <ContextualHelp title={t('admin_platform_settings.help_title')}>
                    {t('admin_platform_settings.help_body')}
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
    return (
        <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
            {label}
        </label>
    );
}

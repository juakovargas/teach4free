import { Head, Link, useForm } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type Language = {
    id: number;
    code: string;
    name: string;
    native_name: string;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    language: Language | null;
};

export default function AdminLanguageForm({ language }: Props) {
    const { t } = useTranslation();
    const form = useForm({
        code: language?.code ?? '',
        name: language?.name ?? '',
        native_name: language?.native_name ?? '',
        is_active: language?.is_active ?? true,
        sort_order: language?.sort_order ?? 0,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (language) {
            form.patch(`/admin/languages/${language.id}`);

            return;
        }

        form.post('/admin/languages');
    };

    return (
        <>
            <Head title={language ? t('admin_languages.edit_title') : t('admin_languages.create_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Languages className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {language ? t('admin_languages.edit_title') : t('admin_languages.create_title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_languages.form_intro')}</p>
                        </div>
                    </div>
                </section>

                <form onSubmit={submit} className="grid max-w-3xl gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <Field label={t('admin_languages.code')} value={form.data.code} onChange={(value) => form.setData('code', value)} error={form.errors.code} />
                    <Field label={t('admin_languages.name')} value={form.data.name} onChange={(value) => form.setData('name', value)} error={form.errors.name} />
                    <Field label={t('admin_languages.native_name')} value={form.data.native_name} onChange={(value) => form.setData('native_name', value)} error={form.errors.native_name} />
                    <Field label={t('admin_languages.sort_order')} value={String(form.data.sort_order)} onChange={(value) => form.setData('sort_order', Number(value))} error={form.errors.sort_order} type="number" />
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.data.is_active} onCheckedChange={(checked) => form.setData('is_active', Boolean(checked))} />
                        {t('admin_languages.active')}
                    </label>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/languages">{t('actions.cancel')}</Link>
                        </Button>
                        <Button type="submit" disabled={form.processing}>{t('actions.save')}</Button>
                    </div>
                </form>

                <ContextualHelp title={t('admin_languages.form_help_title')}>
                    {t('admin_languages.form_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

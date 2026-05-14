import { Head, useForm, usePage } from '@inertiajs/react';
import { MessageSquareWarning } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    type: string;
    teachingOfferId?: number | string | null;
    reportedUserId?: number | string | null;
    classSessionId?: number | string | null;
    types: string[];
};

export default function SupportReport({ type, teachingOfferId, reportedUserId, classSessionId, types }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        type,
        subject: '',
        description: '',
        teaching_offer_id: teachingOfferId ?? '',
        reported_user_id: reportedUserId ?? '',
        class_session_id: classSessionId ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/support/report');
    };

    return (
        <>
            <Head title={t('support_report.meta_title')} />
            <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <MessageSquareWarning className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('support_report.title')}</h1>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('support_report.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={submit} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-muted-foreground dark:border-slate-800 dark:bg-slate-950">
                        {t('support_report.responsible_warning')}
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('support_report.type')}</Label>
                        <select value={form.data.type} onChange={(event) => form.setData('type', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            {types.map((incidentType) => (
                                <option key={incidentType} value={incidentType}>
                                    {t(`incident_types.${incidentType}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="subject">{t('support_report.subject')}</Label>
                        <Input id="subject" value={form.data.subject} onChange={(event) => form.setData('subject', event.target.value)} />
                        {form.errors.subject && <p className="text-xs text-destructive">{form.errors.subject}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">{t('support_report.description')}</Label>
                        <Textarea id="description" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} rows={7} />
                        {form.errors.description && <p className="text-xs text-destructive">{form.errors.description}</p>}
                    </div>
                    <Button type="submit" disabled={form.processing}>{t('support_report.submit')}</Button>
                </form>

            </div>
        </>
    );
}

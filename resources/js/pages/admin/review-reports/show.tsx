import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Flag, Save, Star } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Report = {
    id: number;
    type: string;
    status: string;
    priority: string;
    description: string | null;
    admin_notes: string | null;
    created_at: string | null;
    resolved_at: string | null;
    reporter: { name: string; email: string } | null;
    resolver: { name: string; email: string } | null;
    review: {
        id: number;
        rating: number;
        title: string | null;
        comment: string | null;
        status: string;
        teacher: { name: string; email: string } | null;
        student: { name: string; email: string } | null;
        session: { title: string; status: string } | null;
        offer: { title: string; slug: string } | null;
    } | null;
};

type Props = {
    report: Report;
    statuses: string[];
    priorities: string[];
};

export default function AdminReviewReportShow({ report, statuses, priorities }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        status: report.status,
        priority: report.priority,
        admin_notes: report.admin_notes ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/review-reports/${report.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_review_reports.detail_title', { id: report.id })} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Flag className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_review_reports.detail_title', { id: report.id })}</h1>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{t(`review_report_types.${report.type}`)}</Badge>
                                <Badge variant="outline">{t(`review_report_statuses.${report.status}`)}</Badge>
                                <Badge variant={report.priority === 'urgent' || report.priority === 'high' ? 'destructive' : 'outline'}>{t(`priorities.${report.priority}`)}</Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {flash.status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{flash.status}</div>}

                <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                    <div className="space-y-4">
                        <Panel title={t('admin_review_reports.report_context')}>
                            <dl className="grid gap-3 text-sm md:grid-cols-2">
                                <Info label={t('admin_review_reports.reporter')} value={report.reporter ? `${report.reporter.name} (${report.reporter.email})` : '-'} />
                                <Info label={t('admin_review_reports.created_at')} value={report.created_at ? new Date(report.created_at).toLocaleString() : '-'} />
                                <Info label={t('admin_review_reports.teacher')} value={report.review?.teacher ? `${report.review.teacher.name} (${report.review.teacher.email})` : '-'} />
                                <Info label={t('admin_review_reports.student')} value={report.review?.student ? `${report.review.student.name} (${report.review.student.email})` : '-'} />
                            </dl>
                            {report.description && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-950">{report.description}</p>}
                        </Panel>
                        <Panel title={t('admin_review_reports.review')}>
                            <div className="flex gap-1 text-amber-500">
                                {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-4 ${report.review && star <= report.review.rating ? 'fill-current' : ''}`} />)}
                            </div>
                            <h2 className="mt-3 font-semibold">{report.review?.title ?? t('reviews.untitled_review')}</h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{report.review?.comment ?? t('common.none')}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {report.review && <Button variant="outline" asChild><Link href={`/admin/reviews/${report.review.id}`}>{t('admin_review_reports.open_review')}</Link></Button>}
                                {report.review?.offer && <Button variant="outline" asChild><Link href={`/offers/${report.review.offer.slug}`}>{t('admin_review_reports.open_offer')}</Link></Button>}
                            </div>
                        </Panel>
                    </div>

                    <aside>
                        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('admin_review_reports.admin_review')}</h2>
                            <div className="mt-4 grid gap-3">
                                <Field label={t('admin_review_reports.status')}>
                                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => <SelectItem key={status} value={status}>{t(`review_report_statuses.${status}`)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label={t('admin_review_reports.priority')}>
                                    <Select value={form.data.priority} onValueChange={(value) => form.setData('priority', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {priorities.map((priority) => <SelectItem key={priority} value={priority}>{t(`priorities.${priority}`)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label={t('admin_review_reports.private_admin_notes')} description={t('admin_review_reports.private_admin_notes_help')}>
                                    <Textarea value={form.data.admin_notes} onChange={(event) => form.setData('admin_notes', event.target.value)} rows={6} />
                                </Field>
                                <Button disabled={form.processing}>
                                    <Save />
                                    {t('actions.save')}
                                </Button>
                            </div>
                        </form>
                    </aside>
                </section>

                <ContextualHelp title={t('admin_review_reports.detail_help_title')}>
                    {t('admin_review_reports.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-medium">{value}</dd>
        </div>
    );
}

function Field({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {description && <p className="text-xs leading-5 text-muted-foreground">{description}</p>}
            {children}
        </div>
    );
}

AdminReviewReportShow.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.review_reports',
            href: '/admin/review-reports',
        },
    ],
};

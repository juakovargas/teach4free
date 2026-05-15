import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Flag, Search } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

type Report = {
    id: number;
    type: string;
    status: string;
    priority: string;
    description: string | null;
    created_at: string | null;
    reporter: { name: string; email: string } | null;
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
    reports: Report[];
    filters: { status: string; type: string; priority: string; search: string };
    types: string[];
    statuses: string[];
    priorities: string[];
};

export default function AdminReviewReportsIndex({ reports, filters, types, statuses, priorities }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/review-reports', form.data, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_review_reports.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Flag className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_review_reports.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_review_reports.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{flash.status}</div>}

                <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] dark:border-slate-800 dark:bg-slate-900">
                    <Input value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} placeholder={t('admin_review_reports.search_placeholder')} />
                    <FilterSelect value={form.data.status} onChange={(value) => form.setData('status', value)} allLabel={t('filters.all_statuses')} values={statuses} prefix="review_report_statuses" />
                    <FilterSelect value={form.data.type} onChange={(value) => form.setData('type', value)} allLabel={t('filters.all_types')} values={types} prefix="review_report_types" />
                    <FilterSelect value={form.data.priority} onChange={(value) => form.setData('priority', value)} allLabel={t('filters.all_priorities')} values={priorities} prefix="priorities" />
                    <Button><Search />{t('actions.search')}</Button>
                </form>

                <section className="grid gap-3">
                    {reports.length === 0 && <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">{t('admin_review_reports.empty')}</div>}
                    {reports.map((report) => (
                        <article key={report.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>{t(`review_report_types.${report.type}`)}</Badge>
                                        <Badge variant="outline">{t(`review_report_statuses.${report.status}`)}</Badge>
                                        <Badge variant={report.priority === 'urgent' || report.priority === 'high' ? 'destructive' : 'outline'}>{t(`priorities.${report.priority}`)}</Badge>
                                    </div>
                                    <h2 className="mt-2 font-semibold">{report.review?.title ?? t('reviews.untitled_review')} ({report.review?.rating ?? '-'}/5)</h2>
                                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{report.review?.comment ?? report.description ?? t('common.none')}</p>
                                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                        <p><span className="font-medium text-foreground">{t('admin_review_reports.reporter')}:</span> {report.reporter?.name ?? report.reporter?.email ?? '-'}</p>
                                        <p><span className="font-medium text-foreground">{t('admin_review_reports.teacher')}:</span> {report.review?.teacher?.name ?? report.review?.teacher?.email ?? '-'}</p>
                                        <p><span className="font-medium text-foreground">{t('admin_review_reports.student')}:</span> {report.review?.student?.name ?? report.review?.student?.email ?? '-'}</p>
                                        <p><span className="font-medium text-foreground">{t('admin_review_reports.created_at')}:</span> {report.created_at ? new Date(report.created_at).toLocaleString() : '-'}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/review-reports/${report.id}`}>{t('actions.view')}</Link>
                                </Button>
                            </div>
                        </article>
                    ))}
                </section>

                <ContextualHelp title={t('admin_review_reports.help_title')}>
                    {t('admin_review_reports.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function FilterSelect({ value, onChange, allLabel, values, prefix }: { value: string; onChange: (value: string) => void; allLabel: string; values: string[]; prefix: string }) {
    const { t } = useTranslation();

    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{allLabel}</SelectItem>
                {values.map((item) => <SelectItem key={item} value={item}>{t(`${prefix}.${item}`)}</SelectItem>)}
            </SelectContent>
        </Select>
    );
}

AdminReviewReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.review_reports',
            href: '/admin/review-reports',
        },
    ],
};

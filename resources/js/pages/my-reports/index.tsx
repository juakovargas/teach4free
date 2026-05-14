import { Head, Link, router, usePage } from '@inertiajs/react';
import { MessageSquareWarning, ShieldAlert } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

type ReportSummary = {
    kind: 'incident' | 'conversation_report';
    id: number;
    subject: string;
    type: string;
    type_key_prefix: string;
    status: string;
    status_key_prefix: string;
    context: { label: string; value: string | null; url: string | null };
    message_excerpt?: string | null;
    created_at: string | null;
    updated_at: string | null;
    has_public_response: boolean;
    public_response_sent_at?: string | null;
    detail_url: string;
};

type Props = {
    filters: { status: string };
    statuses: string[];
    incidents: ReportSummary[];
    conversationReports: ReportSummary[];
    summary: {
        open_reports_count: number;
        reports_with_response_count: number;
    };
};

export default function MyReportsIndex({ filters, statuses, incidents, conversationReports, summary }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const [status, setStatus] = useState(filters.status);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/my-reports', { status }, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('my_reports.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('my_reports.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('my_reports.intro')}</p>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <SummaryCard label={t('my_reports.open_reports')} value={summary.open_reports_count} />
                        <SummaryCard label={t('my_reports.reports_with_response')} value={summary.reports_with_response_count} />
                    </div>
                </section>

                <ResponsibleNotice />

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={submit} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-end dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-2 sm:w-72">
                        <span className="text-sm font-medium">{t('my_reports.filter_status')}</span>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('common.all')}</SelectItem>
                                {statuses.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {t(`incident_statuses.${item}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button>{t('actions.filter')}</Button>
                </form>

                <ReportSection title={t('my_reports.general_reports')} empty={t('my_reports.empty_general')} reports={incidents} />
                <ReportSection title={t('my_reports.conversation_reports')} empty={t('my_reports.empty_conversation')} reports={conversationReports} />

                <ContextualHelp title={t('my_reports.help_title')}>
                    {t('my_reports.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <article className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
        </article>
    );
}

function ResponsibleNotice() {
    const { t } = useTranslation();

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex gap-3">
                <MessageSquareWarning className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
                <p>{t('my_reports.responsible_warning')}</p>
            </div>
        </section>
    );
}

function ReportSection({ title, empty, reports }: { title: string; empty: string; reports: ReportSummary[] }) {
    return (
        <section className="space-y-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            {reports.length === 0 && (
                <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    {empty}
                </div>
            )}
            {reports.map((report) => (
                <ReportCard key={`${report.kind}-${report.id}`} report={report} />
            ))}
        </section>
    );
}

function ReportCard({ report }: { report: ReportSummary }) {
    const { t } = useTranslation();

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                        <Badge>{t(`${report.type_key_prefix}.${report.type}`)}</Badge>
                        <Badge variant="outline">{t(`${report.status_key_prefix}.${report.status}`)}</Badge>
                        {report.has_public_response && <Badge variant="outline">{t('my_reports.response_available')}</Badge>}
                    </div>
                    <h3 className="mt-3 text-base font-semibold">{report.subject}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{t(report.context.label)}:</span>{' '}
                        {report.context.url && report.context.value ? (
                            <Link href={report.context.url} className="text-emerald-700 hover:underline dark:text-emerald-300">
                                {report.context.value}
                            </Link>
                        ) : (
                            report.context.value ?? t('common.not_applicable')
                        )}
                    </p>
                    {report.message_excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{report.message_excerpt}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                        {t('my_reports.created_at')}: {report.created_at ? new Date(report.created_at).toLocaleString() : '-'} / {t('my_reports.updated_at')}: {report.updated_at ? new Date(report.updated_at).toLocaleString() : '-'}
                    </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link href={report.detail_url}>{t('my_reports.open_report')}</Link>
                </Button>
            </div>
        </article>
    );
}

MyReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'navigation.my_reports',
            href: '/my-reports',
        },
    ],
};

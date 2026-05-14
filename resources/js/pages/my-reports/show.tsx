import { Head, Link } from '@inertiajs/react';
import { MessageSquareWarning, ShieldAlert } from 'lucide-react';

import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type ReportDetail = {
    kind: 'incident' | 'conversation_report';
    id: number;
    subject: string;
    type: string;
    type_key_prefix: string;
    status: string;
    status_key_prefix: string;
    context: { label: string; value: string | null; url: string | null };
    message_excerpt?: string | null;
    description: string | null;
    public_response: string | null;
    public_response_sent_at: string | null;
    public_responder_name?: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type Props = {
    report: ReportDetail;
};

export default function MyReportShow({ report }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('my_reports.detail_title', { subject: report.subject })} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <ShieldAlert className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                            <div>
                                <h1 className="text-2xl font-semibold tracking-normal">{report.subject}</h1>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge>{t(`${report.type_key_prefix}.${report.type}`)}</Badge>
                                    <Badge variant="outline">{t(`${report.status_key_prefix}.${report.status}`)}</Badge>
                                    <Badge variant="outline">{t(`my_reports.kind_${report.kind}`)}</Badge>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/my-reports">{t('my_reports.back_to_reports')}</Link>
                        </Button>
                    </div>
                </section>

                <ResponsibleNotice />

                <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                    <div className="space-y-4">
                        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-lg font-semibold">{t('my_reports.original_report')}</h2>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{report.description ?? t('common.not_applicable')}</p>
                            {report.message_excerpt && (
                                <div className="mt-4 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                                    <p className="font-medium">{t('my_reports.reported_message_excerpt')}</p>
                                    <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{report.message_excerpt}</p>
                                </div>
                            )}
                        </article>

                        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-lg font-semibold">{t('my_reports.public_response')}</h2>
                            {report.public_response ? (
                                <>
                                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{report.public_response}</p>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        {t('my_reports.response_sent_at')}: {report.public_response_sent_at ? new Date(report.public_response_sent_at).toLocaleString() : '-'}
                                    </p>
                                </>
                            ) : (
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t('my_reports.no_public_response')}</p>
                            )}
                        </article>
                    </div>

                    <aside className="space-y-4">
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('my_reports.report_state')}</h2>
                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(`my_reports.state_${report.status}`)}</p>
                        </section>
                        <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('my_reports.report_context')}</h2>
                            <dl className="mt-3 grid gap-3">
                                <Info label={t('my_reports.status')} value={t(`${report.status_key_prefix}.${report.status}`)} />
                                <Info label={t('my_reports.created_at')} value={report.created_at ? new Date(report.created_at).toLocaleString() : '-'} />
                                <Info label={t('my_reports.updated_at')} value={report.updated_at ? new Date(report.updated_at).toLocaleString() : '-'} />
                                <Info
                                    label={t(report.context.label)}
                                    value={report.context.value ?? t('common.not_applicable')}
                                    url={report.context.url}
                                />
                            </dl>
                        </section>
                    </aside>
                </section>

                <ContextualHelp title={t('my_reports.detail_help_title')}>
                    {t('my_reports.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
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

function Info({ label, value, url }: { label: string; value: string; url?: string | null }) {
    return (
        <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-medium">
                {url ? (
                    <Link href={url} className="text-emerald-700 hover:underline dark:text-emerald-300">
                        {value}
                    </Link>
                ) : (
                    value
                )}
            </dd>
        </div>
    );
}

MyReportShow.layout = {
    breadcrumbs: [
        {
            title: 'navigation.my_reports',
            href: '/my-reports',
        },
    ],
};

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Flag, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import type { ReactNode } from 'react';

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
    reporter: { name: string; email: string } | null;
    reported_user: { name: string; email: string } | null;
    resolver: { name: string; email: string } | null;
    message: { body: string; sender?: { name: string; email: string } | null } | null;
    conversation: {
        id: number;
        subject: string | null;
        type: string;
        status: string;
        participants: { role: string; user: { name: string; email: string } | null }[];
    };
};

type Props = {
    report: Report;
    statuses: string[];
    priorities: string[];
};

export default function AdminConversationReportShow({ report, statuses, priorities }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        status: report.status,
        priority: report.priority,
        admin_notes: report.admin_notes ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/conversation-reports/${report.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_conversation_reports.detail_title', { id: report.id })} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Flag className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_conversation_reports.detail_title', { id: report.id })}</h1>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{t(`conversation_report_types.${report.type}`)}</Badge>
                                <Badge variant="outline">{t(`conversation_report_statuses.${report.status}`)}</Badge>
                                <Badge variant={report.priority === 'urgent' || report.priority === 'high' ? 'destructive' : 'outline'}>{t(`priorities.${report.priority}`)}</Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {flash.status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{flash.status}</div>}

                <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                    <div className="space-y-4">
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('admin_conversation_reports.report_context')}</h2>
                            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                                <Info label={t('admin_conversation_reports.reporter')} value={report.reporter ? `${report.reporter.name} (${report.reporter.email})` : '-'} />
                                <Info label={t('admin_conversation_reports.reported_user')} value={report.reported_user ? `${report.reported_user.name} (${report.reported_user.email})` : '-'} />
                                <Info label={t('admin_conversation_reports.created_at')} value={report.created_at ? new Date(report.created_at).toLocaleString() : '-'} />
                                <Info label={t('admin_conversation_reports.conversation')} value={report.conversation.subject ?? t('messages.untitled_conversation')} />
                            </dl>
                            {report.description && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-950">{report.description}</p>}
                            {report.message && (
                                <div className="mt-4 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800">
                                    <p className="font-medium">{t('admin_conversation_reports.reported_message')}</p>
                                    <p className="mt-2 whitespace-pre-line text-muted-foreground">{report.message.body}</p>
                                </div>
                            )}
                        </section>
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('messages.participants')}</h2>
                            <div className="mt-3 grid gap-2">
                                {report.conversation.participants.map((participant) => (
                                    <div key={`${participant.role}-${participant.user?.email}`} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                                        <p className="font-medium">{participant.user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{participant.user?.email}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{t(`conversation_participant_roles.${participant.role}`)}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-4">
                        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('admin_conversation_reports.review')}</h2>
                            <div className="mt-4 grid gap-3">
                                <Field label={t('admin_conversation_reports.status')}>
                                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => <SelectItem key={status} value={status}>{t(`conversation_report_statuses.${status}`)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label={t('admin_conversation_reports.priority')}>
                                    <Select value={form.data.priority} onValueChange={(value) => form.setData('priority', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {priorities.map((priority) => <SelectItem key={priority} value={priority}>{t(`priorities.${priority}`)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label={t('admin_conversation_reports.admin_notes')}>
                                    <Textarea value={form.data.admin_notes} onChange={(event) => form.setData('admin_notes', event.target.value)} />
                                </Field>
                                <Button disabled={form.processing}>
                                    <Save />
                                    {t('actions.save')}
                                </Button>
                            </div>
                        </form>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/conversations/${report.conversation.id}`}>{t('admin_conversation_reports.open_conversation')}</Link>
                        </Button>
                    </aside>
                </section>

                <ContextualHelp title={t('admin_conversation_reports.detail_help_title')}>
                    {t('admin_conversation_reports.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
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

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

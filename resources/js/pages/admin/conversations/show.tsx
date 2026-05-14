import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Lock, RotateCcw } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type Conversation = {
    id: number;
    type: string;
    status: string;
    subject: string | null;
    close_reason: string | null;
    participants: { role: string; user: { name: string; email: string; banned_at?: string | null; blocked_at?: string | null } | null }[];
    messages: { id: number; body: string; system_message: boolean; created_at: string | null; sender: { name: string; email: string } | null }[];
    reports: { id: number; type: string; status: string; priority: string; created_at: string | null }[];
    context: { offer?: { title: string; slug: string } | null; session?: { title: string; status: string } | null };
};

type Props = {
    conversation: Conversation;
};

export default function AdminConversationShow({ conversation }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({ action: conversation.status === 'closed' ? 'reopen' : 'close', close_reason: conversation.close_reason ?? '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/conversations/${conversation.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={conversation.subject ?? t('messages.untitled_conversation')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{conversation.subject ?? t('messages.untitled_conversation')}</h1>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{t(`conversation_types.${conversation.type}`)}</Badge>
                                <Badge variant="outline">{t(`conversation_statuses.${conversation.status}`)}</Badge>
                                {conversation.context.offer && <Badge variant="outline">{conversation.context.offer.title}</Badge>}
                            </div>
                        </div>
                        <Link href="/admin/conversation-reports" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                            {t('admin_conversation_reports.title')}
                        </Link>
                    </div>
                </section>

                {flash.status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{flash.status}</div>}

                <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-4">
                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('admin_conversations.messages')}</h2>
                            <div className="mt-4 grid gap-3">
                                {conversation.messages.map((message) => (
                                    <div key={message.id} className={message.system_message ? 'rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-950' : 'rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800'}>
                                        <p className="font-medium">{message.sender?.name ?? t('messages.system_sender')}</p>
                                        <p className="mt-1 whitespace-pre-line text-muted-foreground">{message.body}</p>
                                        <p className="mt-2 text-xs text-muted-foreground">{message.created_at ? new Date(message.created_at).toLocaleString() : '-'}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                    <aside className="space-y-4">
                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('messages.participants')}</h2>
                            <div className="mt-3 grid gap-2 text-sm">
                                {conversation.participants.map((participant) => (
                                    <div key={`${participant.role}-${participant.user?.email}`} className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
                                        <p className="font-medium">{participant.user?.name}</p>
                                        <p className="text-xs text-muted-foreground">{participant.user?.email}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{t(`conversation_participant_roles.${participant.role}`)}</p>
                                        {(participant.user?.banned_at || participant.user?.blocked_at) && <Badge className="mt-2" variant="destructive">{t('messages.restricted_user')}</Badge>}
                                    </div>
                                ))}
                            </div>
                        </section>
                        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('admin_conversations.admin_actions')}</h2>
                            {conversation.status !== 'closed' && (
                                <div className="mt-3 grid gap-2">
                                    <Label>{t('admin_conversations.close_reason')}</Label>
                                    <Input value={form.data.close_reason} onChange={(event) => form.setData('close_reason', event.target.value)} />
                                </div>
                            )}
                            <Button className="mt-3" variant="outline" disabled={form.processing}>
                                {conversation.status === 'closed' ? <RotateCcw /> : <Lock />}
                                {conversation.status === 'closed' ? t('admin_conversations.reopen') : t('admin_conversations.close')}
                            </Button>
                        </form>
                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('admin_conversations.linked_reports')}</h2>
                            <div className="mt-3 grid gap-2">
                                {conversation.reports.length === 0 && <p className="text-sm text-muted-foreground">{t('admin_conversations.no_reports')}</p>}
                                {conversation.reports.map((report) => (
                                    <Link key={report.id} href={`/admin/conversation-reports/${report.id}`} className="rounded-md border border-slate-200 p-3 text-sm hover:border-emerald-300 dark:border-slate-800">
                                        <p className="font-medium">{t(`conversation_report_types.${report.type}`)}</p>
                                        <p className="text-xs text-muted-foreground">{t(`conversation_report_statuses.${report.status}`)} / {t(`priorities.${report.priority}`)}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </aside>
                </section>

                <ContextualHelp title={t('admin_conversations.detail_help_title')}>
                    {t('admin_conversations.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

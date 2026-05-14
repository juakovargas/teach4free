import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { MessagesSquare, Search } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

type Conversation = {
    id: number;
    type: string;
    status: string;
    subject: string | null;
    last_message_at: string | null;
    reports_count: number;
    participants: { role: string; user: { name: string; email: string } | null }[];
    last_message: { body: string; sender_name: string | null; created_at: string | null; system_message: boolean } | null;
};

type Props = {
    conversations: Conversation[];
    filters: { status: string; type: string; reported: boolean; search: string };
    statuses: string[];
    types: string[];
};

export default function AdminConversations({ conversations, filters, statuses, types }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        status: filters.status,
        type: filters.type,
        reported: filters.reported,
        search: filters.search,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/conversations', form.data, { preserveState: true });
    };

    return (
        <>
            <Head title={t('admin_conversations.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <MessagesSquare className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_conversations.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_conversations.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{flash.status}</div>}

                <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs lg:grid-cols-[1fr_12rem_12rem_auto_auto] dark:border-slate-800 dark:bg-slate-900">
                    <Input value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} placeholder={t('admin_conversations.search_placeholder')} />
                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('filters.all_statuses')}</SelectItem>
                            {statuses.map((status) => <SelectItem key={status} value={status}>{t(`conversation_statuses.${status}`)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={form.data.type} onValueChange={(value) => form.setData('type', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('filters.all_types')}</SelectItem>
                            {types.map((type) => <SelectItem key={type} value={type}>{t(`conversation_types.${type}`)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={form.data.reported} onCheckedChange={(value) => form.setData('reported', value === true)} />
                        {t('admin_conversations.reported_only')}
                    </label>
                    <Button><Search />{t('actions.search')}</Button>
                </form>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-0 divide-y divide-slate-200 dark:divide-slate-800">
                        {conversations.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">{t('admin_conversations.empty')}</p>}
                        {conversations.map((conversation) => (
                            <Link key={conversation.id} href={`/admin/conversations/${conversation.id}`} className="grid gap-3 p-4 transition hover:bg-slate-50 lg:grid-cols-[1fr_auto] dark:hover:bg-slate-950">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-semibold">{conversation.subject ?? t('messages.untitled_conversation')}</h2>
                                        <Badge>{t(`conversation_types.${conversation.type}`)}</Badge>
                                        <Badge variant="outline">{t(`conversation_statuses.${conversation.status}`)}</Badge>
                                        {conversation.reports_count > 0 && <Badge variant="destructive">{t('admin_conversations.reports_count', { count: conversation.reports_count })}</Badge>}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {conversation.participants.map((participant) => participant.user?.name).filter(Boolean).join(', ')}
                                    </p>
                                    <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{conversation.last_message?.body ?? t('messages.no_messages')}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">{conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : '-'}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <ContextualHelp title={t('admin_conversations.help_title')}>
                    {t('admin_conversations.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

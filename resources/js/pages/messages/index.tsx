import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Inbox, Search } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Participant = {
    user: { name: string; avatar?: string | null; is_restricted?: boolean } | null;
};

type Conversation = {
    id: number;
    type: string;
    status: string;
    subject: string | null;
    last_message_at: string | null;
    unread_count: number;
    other_participants: Participant[];
    last_message: { body: string; sender_name: string | null; created_at: string | null; system_message: boolean } | null;
    context: {
        offer?: { title: string; slug: string } | null;
        session?: { title: string; status: string; starts_at: string | null } | null;
    };
};

type Props = {
    conversations: Conversation[];
    filters: { search: string; filter: string };
};

const filters = ['all', 'unread', 'applications', 'sessions', 'archived'];

export default function MessageInbox({ conversations, filters: currentFilters }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        search: currentFilters.search ?? '',
        filter: currentFilters.filter ?? 'all',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/messages', form.data, { preserveState: true });
    };

    return (
        <>
            <Head title={t('messages.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Inbox className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('messages.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('messages.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-[1fr_14rem_auto] dark:border-slate-800 dark:bg-slate-900">
                    <Input value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} placeholder={t('messages.search_placeholder')} />
                    <Select value={form.data.filter} onValueChange={(value) => form.setData('filter', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {filters.map((filter) => (
                                <SelectItem key={filter} value={filter}>
                                    {t(`message_filters.${filter}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button>
                        <Search />
                        {t('actions.search')}
                    </Button>
                </form>

                <section className="grid gap-3">
                    {conversations.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {t('messages.empty')}
                        </div>
                    )}
                    {conversations.map((conversation) => (
                        <ConversationRow key={conversation.id} conversation={conversation} />
                    ))}
                </section>

                <ContextualHelp title={t('messages.help_title')}>
                    {t('messages.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const firstUser = conversation.other_participants[0]?.user;
    const participantLabel = conversation.other_participants.length > 1
        ? t('messages.group_label', { count: conversation.other_participants.length })
        : firstUser?.name ?? t('messages.no_other_participant');

    return (
        <Link href={`/messages/${conversation.id}`} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="size-11">
                        <AvatarImage src={firstUser?.avatar ?? undefined} alt={participantLabel} />
                        <AvatarFallback>{getInitials(participantLabel)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="truncate font-semibold">{participantLabel}</h2>
                            <Badge variant={conversation.unread_count > 0 ? 'default' : 'outline'}>
                                {t(`conversation_types.${conversation.type}`)}
                            </Badge>
                            <Badge variant="outline">{t(`conversation_statuses.${conversation.status}`)}</Badge>
                            {conversation.unread_count > 0 && <Badge>{t('messages.unread_count', { count: conversation.unread_count })}</Badge>}
                        </div>
                        <p className="mt-1 truncate text-sm font-medium">{conversation.subject ?? t('messages.untitled_conversation')}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {conversation.last_message
                                ? conversation.last_message.system_message
                                    ? conversation.last_message.body
                                    : `${conversation.last_message.sender_name ?? t('messages.system_sender')}: ${conversation.last_message.body}`
                                : t('messages.no_messages')}
                        </p>
                        {conversation.context.offer && (
                            <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{conversation.context.offer.title}</p>
                        )}
                    </div>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">
                    {conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString() : '-'}
                </p>
            </div>
        </Link>
    );
}

MessageInbox.layout = {
    breadcrumbs: [
        {
            title: 'navigation.messages',
            href: '/messages',
        },
    ],
};

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Archive, Flag, MessageCircle, Send, ShieldAlert } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import type { Auth } from '@/types';

type Participant = {
    role: string;
    user: { id: number; name: string; avatar?: string | null; is_restricted?: boolean } | null;
};

type Message = {
    id: number;
    body: string;
    system_message: boolean;
    created_at: string | null;
    sender: { id: number; name: string; avatar?: string | null } | null;
};

type Conversation = {
    id: number;
    type: string;
    status: string;
    subject: string | null;
    can_send: boolean;
    close_reason: string | null;
    participants: Participant[];
    messages: Message[];
    context: {
        offer?: { title: string; slug: string } | null;
        session?: { title: string; status: string; starts_at: string | null; timezone?: string | null } | null;
        application?: { id: number; status: string } | null;
    };
};

type Props = {
    conversation: Conversation;
    reportTypes: string[];
};

export default function MessageConversation({ conversation, reportTypes }: Props) {
    const { t } = useTranslation();
    const { auth, flash } = usePage().props as { auth: Auth; flash: { status?: string } };
    const form = useForm({ body: '' });
    const reportForm = useForm({ type: 'payment_request', description: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/messages/${conversation.id}`, {
            preserveScroll: true,
            onSuccess: () => form.reset('body'),
        });
    };

    const reportConversation = (event: FormEvent) => {
        event.preventDefault();
        reportForm.post(`/messages/${conversation.id}/report`, {
            preserveScroll: true,
            onSuccess: () => reportForm.reset('description'),
        });
    };

    return (
        <>
            <Head title={conversation.subject ?? t('messages.untitled_conversation')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-4">
                            <MessageCircle className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                            <div>
                                <h1 className="text-2xl font-semibold tracking-normal">{conversation.subject ?? t('messages.untitled_conversation')}</h1>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge>{t(`conversation_types.${conversation.type}`)}</Badge>
                                    <Badge variant="outline">{t(`conversation_statuses.${conversation.status}`)}</Badge>
                                    {conversation.context.application && <Badge variant="outline">{t(`application_statuses.${conversation.context.application.status}`)}</Badge>}
                                    {conversation.context.session && <Badge variant="outline">{t(`session_statuses.${conversation.context.session.status}`)}</Badge>}
                                </div>
                                {conversation.context.offer && (
                                    <Link href={`/offers/${conversation.context.offer.slug}`} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                                        {conversation.context.offer.title}
                                    </Link>
                                )}
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={`/messages/${conversation.id}/archive`} method="post" as="button">
                                <Archive />
                                {t('messages.archive')}
                            </Link>
                        </Button>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                            <div className="flex gap-2">
                                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                                <p>{t('messages.safety_note')}</p>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {conversation.messages.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">{t('messages.no_messages')}</p>
                            )}
                            {conversation.messages.map((message) => (
                                <MessageBubble
                                    key={message.id}
                                    conversationId={conversation.id}
                                    message={message}
                                    own={message.sender?.id === auth.user?.id}
                                    reportTypes={reportTypes}
                                />
                            ))}
                        </div>

                        {conversation.can_send ? (
                            <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <Label htmlFor="body">{t('messages.reply')}</Label>
                                <Textarea id="body" className="mt-2 min-h-28" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} />
                                <InputError message={form.errors.body} />
                                <Button className="mt-3" disabled={form.processing}>
                                    <Send />
                                    {t('messages.send')}
                                </Button>
                            </form>
                        ) : (
                            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                {conversation.close_reason ?? t('messages.cannot_send')}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('messages.participants')}</h2>
                            <div className="mt-3 grid gap-3">
                                {conversation.participants.map((participant) => (
                                    <ParticipantRow key={`${participant.role}-${participant.user?.id}`} participant={participant} />
                                ))}
                            </div>
                        </section>

                        <form onSubmit={reportConversation} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="flex items-center gap-2 font-semibold">
                                <Flag className="size-4 text-destructive" />
                                {t('messages.report_conversation')}
                            </h2>
                            <div className="mt-3 space-y-3">
                                <Select value={reportForm.data.type} onValueChange={(value) => reportForm.setData('type', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {t(`conversation_report_types.${type}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Textarea value={reportForm.data.description} onChange={(event) => reportForm.setData('description', event.target.value)} placeholder={t('messages.report_description')} />
                                <Button variant="outline" disabled={reportForm.processing}>
                                    {t('messages.submit_report')}
                                </Button>
                            </div>
                        </form>
                    </aside>
                </section>

                <ContextualHelp title={t('messages.detail_help_title')}>
                    {t('messages.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function ParticipantRow({ participant }: { participant: Participant }) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const name = participant.user?.name ?? t('messages.unknown_participant');

    return (
        <div className="flex items-center gap-3">
            <Avatar className="size-9">
                <AvatarImage src={participant.user?.avatar ?? undefined} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="text-xs text-muted-foreground">
                    {t(`conversation_participant_roles.${participant.role}`)}
                    {participant.user?.is_restricted ? ` / ${t('messages.restricted_user')}` : ''}
                </p>
            </div>
        </div>
    );
}

function MessageBubble({ conversationId, message, own, reportTypes }: { conversationId: number; message: Message; own: boolean; reportTypes: string[] }) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const form = useForm({ type: 'payment_request', description: '' });

    if (message.system_message) {
        return (
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-muted-foreground dark:bg-slate-950">
                {message.body}
            </div>
        );
    }

    const name = message.sender?.name ?? t('messages.unknown_participant');

    return (
        <div className={own ? 'ml-auto max-w-2xl' : 'mr-auto max-w-2xl'}>
            <div className={`flex gap-3 ${own ? 'flex-row-reverse' : ''}`}>
                <Avatar className="size-9">
                    <AvatarImage src={message.sender?.avatar ?? undefined} alt={name} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className={own ? 'text-right' : ''}>
                    <p className="text-xs text-muted-foreground">
                        {name} / {message.created_at ? new Date(message.created_at).toLocaleString() : '-'}
                    </p>
                    <div className={`mt-1 rounded-lg px-4 py-3 text-sm leading-6 ${own ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-slate-50'}`}>
                        {message.body}
                    </div>
                    {!own && (
                        <form
                            className="mt-2 grid gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.post(`/messages/${conversationId}/messages/${message.id}/report`, {
                                    preserveScroll: true,
                                    onSuccess: () => form.reset('description'),
                                });
                            }}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Select value={form.data.type} onValueChange={(value) => form.setData('type', value)}>
                                    <SelectTrigger className="h-8 text-xs sm:w-56">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {t(`conversation_report_types.${type}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="ghost" size="sm" disabled={form.processing}>
                                    <Flag className="size-3" />
                                    {t('messages.report_message')}
                                </Button>
                            </div>
                            <Textarea className="min-h-16 text-xs" value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} placeholder={t('messages.report_description')} />
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

MessageConversation.layout = {
    breadcrumbs: [
        {
            title: 'navigation.messages',
            href: '/messages',
        },
    ],
};

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Archive, Check, Clipboard, CornerUpLeft, EllipsisVertical, Flag, MessageCircle, Send, ShieldAlert } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type ReplyTarget = {
    id: number;
    body: string;
    sender: { id: number; name: string } | null;
};

type Message = {
    id: number;
    body: string;
    system_message: boolean;
    created_at: string | null;
    reply_to_message: ReplyTarget | null;
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
    const [conversationReportOpen, setConversationReportOpen] = useState(false);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const form = useForm<{ body: string; reply_to_message_id: number | null }>({ body: '', reply_to_message_id: null });

    const selectReply = (message: Message) => {
        setReplyTo(message);
        form.setData('reply_to_message_id', message.id);
        window.setTimeout(() => document.getElementById('body')?.focus(), 0);
    };

    const clearReply = () => {
        setReplyTo(null);
        form.setData('reply_to_message_id', null);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/messages/${conversation.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('body');
                clearReply();
            },
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
                        <ConversationActions conversationId={conversation.id} onReport={() => setConversationReportOpen(true)} />
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <ReportDialog
                    actionUrl={`/messages/${conversation.id}/report`}
                    open={conversationReportOpen}
                    reportTypes={reportTypes}
                    title={t('messages.report_conversation')}
                    onOpenChange={setConversationReportOpen}
                />

                <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex gap-2 text-muted-foreground">
                                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-emerald-700 dark:text-emerald-300" />
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
                                    canReply={conversation.can_send}
                                    conversationId={conversation.id}
                                    message={message}
                                    own={message.sender?.id === auth.user?.id}
                                    reportTypes={reportTypes}
                                    onReply={selectReply}
                                />
                            ))}
                        </div>

                        {conversation.can_send ? (
                            <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                {replyTo && (
                                    <div className="mb-3 flex items-start justify-between gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                                        <div className="min-w-0">
                                            <p className="font-medium text-emerald-950 dark:text-emerald-100">
                                                {t('messages.replying_to', { sender: replyTo.sender?.name ?? t('messages.system_sender') })}
                                            </p>
                                            <p className="mt-1 truncate text-muted-foreground">{excerpt(replyTo.body)}</p>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={clearReply}>
                                            {t('messages.cancel_reply')}
                                        </Button>
                                    </div>
                                )}
                                <Label htmlFor="body">{t('messages.reply')}</Label>
                                <Textarea id="body" className="mt-2 min-h-28" value={form.data.body} onChange={(event) => form.setData('body', event.target.value)} />
                                <InputError message={form.errors.body ?? form.errors.reply_to_message_id} />
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
                    </aside>
                </section>

                <ContextualHelp title={t('messages.detail_help_title')}>
                    {t('messages.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function ConversationActions({ conversationId, onReport }: { conversationId: number; onReport: () => void }) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label={t('messages.conversation_actions')}>
                    <EllipsisVertical className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                    <Link href={`/messages/${conversationId}/archive`} method="post" as="button">
                        <Archive />
                        {t('messages.archive')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onSelect={(event) => {
                        event.preventDefault();
                        onReport();
                    }}
                >
                    <Flag />
                    {t('messages.report_conversation')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
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

function MessageBubble({
    canReply,
    conversationId,
    message,
    own,
    reportTypes,
    onReply,
}: {
    canReply: boolean;
    conversationId: number;
    message: Message;
    own: boolean;
    reportTypes: string[];
    onReply: (message: Message) => void;
}) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const [reportOpen, setReportOpen] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<'copied' | 'failed' | null>(null);

    if (message.system_message) {
        return (
            <div className="rounded-lg bg-slate-50 px-4 py-3 text-center text-sm text-muted-foreground dark:bg-slate-950">
                {message.body}
            </div>
        );
    }

    const name = message.sender?.name ?? t('messages.unknown_participant');

    const copyMessage = () => {
        copyText(message.body).then((copied) => {
            setCopyFeedback(copied ? 'copied' : 'failed');
            window.setTimeout(() => setCopyFeedback(null), 2200);
        });
    };

    return (
        <div className={own ? 'ml-auto max-w-2xl' : 'mr-auto max-w-2xl'}>
            <ReportDialog
                actionUrl={`/messages/${conversationId}/messages/${message.id}/report`}
                open={reportOpen}
                reportTypes={reportTypes}
                title={t('messages.report_message')}
                onOpenChange={setReportOpen}
            />
            <div className={`flex gap-3 ${own ? 'flex-row-reverse' : ''}`}>
                <Avatar className="size-9">
                    <AvatarImage src={message.sender?.avatar ?? undefined} alt={name} />
                    <AvatarFallback>{getInitials(name)}</AvatarFallback>
                </Avatar>
                <div className={own ? 'min-w-0 text-right' : 'min-w-0'}>
                    <div className={`flex items-center gap-2 ${own ? 'justify-end' : ''}`}>
                        <p className="text-xs text-muted-foreground">
                            {name} / {message.created_at ? new Date(message.created_at).toLocaleString() : '-'}
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label={t('messages.message_actions')}>
                                    <EllipsisVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={own ? 'end' : 'start'} className="w-52">
                                {canReply && (
                                    <DropdownMenuItem onSelect={() => onReply(message)}>
                                        <CornerUpLeft />
                                        {t('messages.reply')}
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onSelect={copyMessage}>
                                    {copyFeedback === 'copied' ? <Check /> : <Clipboard />}
                                    {t('messages.copy_message')}
                                </DropdownMenuItem>
                                {!own && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onSelect={(event) => {
                                                event.preventDefault();
                                                setReportOpen(true);
                                            }}
                                        >
                                            <Flag />
                                            {t('messages.report_message')}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className={`mt-1 rounded-lg px-4 py-3 text-sm leading-6 ${own ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-slate-50'}`}>
                        {message.reply_to_message && (
                            <div className={`mb-3 rounded-md border-l-2 px-3 py-2 text-xs ${own ? 'border-white/60 bg-white/10 text-emerald-50' : 'border-emerald-500 bg-white/70 text-slate-700 dark:bg-slate-900/50 dark:text-slate-200'}`}>
                                <p className="font-medium">
                                    {t('messages.replying_to', { sender: message.reply_to_message.sender?.name ?? t('messages.system_sender') })}
                                </p>
                                <p className="mt-1 line-clamp-2">{excerpt(message.reply_to_message.body)}</p>
                            </div>
                        )}
                        <p className="whitespace-pre-wrap">{message.body}</p>
                    </div>
                    {copyFeedback && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t(copyFeedback === 'copied' ? 'messages.copy_success' : 'messages.copy_failed')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function ReportDialog({
    actionUrl,
    open,
    reportTypes,
    title,
    onOpenChange,
}: {
    actionUrl: string;
    open: boolean;
    reportTypes: string[];
    title: string;
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const form = useForm({ type: 'payment_request', description: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(actionUrl, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('description');
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{t('messages.report_modal_intro')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-muted-foreground dark:border-slate-800 dark:bg-slate-950">
                        {t('my_reports.responsible_warning')}
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('messages.report_type')}</Label>
                        <Select value={form.data.type} onValueChange={(value) => form.setData('type', value)}>
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
                        <InputError message={form.errors.type} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="report-description">{t('messages.report_description_label')}</Label>
                        <Textarea
                            id="report-description"
                            className="min-h-28"
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                            placeholder={t('messages.report_description')}
                        />
                        <InputError message={form.errors.description} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                {t('actions.cancel')}
                            </Button>
                        </DialogClose>
                        <Button disabled={form.processing}>
                            <Flag />
                            {t('messages.submit_report')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function excerpt(value: string, limit = 140): string {
    const normalized = value.replace(/\s+/g, ' ').trim();

    return normalized.length > limit ? `${normalized.slice(0, limit - 1)}...` : normalized;
}

async function copyText(value: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);

            return true;
        }

        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);

        return copied;
    } catch {
        return false;
    }
}

MessageConversation.layout = {
    breadcrumbs: [
        {
            title: 'navigation.messages',
            href: '/messages',
        },
    ],
};

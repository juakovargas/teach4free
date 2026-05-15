import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, ExternalLink, Star, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type SessionRow = {
    attendance_id: number;
    attendance_status: string;
    can_cancel: boolean;
    session: {
        id: number;
        title: string;
        starts_at: string | null;
        ends_at: string | null;
        timezone: string;
        status: string;
        meeting_tool: string;
        meeting_url: string | null;
        conversation_id: number | null;
        offer: { title: string; slug: string };
        teacher: { name: string; email: string; avatar?: string | null };
    };
    review: {
        can_review: boolean;
        submitted: boolean;
        id: number | null;
        status: string | null;
        rating: number | null;
    };
};

type Props = {
    sessions: SessionRow[];
};

export default function MySessions({ sessions }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const getInitials = useInitials();

    return (
        <>
            <Head title={t('sessions.my_meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <CalendarDays className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('sessions.my_title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('sessions.my_intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-4">
                    {sessions.length === 0 && <Empty>{t('sessions.empty_student')}</Empty>}
                    {sessions.map(({ session, attendance_status, can_cancel, review }) => (
                        <article key={session.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>{t(`session_statuses.${session.status}`)}</Badge>
                                        <Badge variant="outline">{t(`attendee_statuses.${attendance_status}`)}</Badge>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">{session.title}</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {new Date(session.starts_at ?? '').toLocaleString()} - {new Date(session.ends_at ?? '').toLocaleString()} / {session.timezone}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-10">
                                            <AvatarImage src={session.teacher.avatar ?? undefined} alt={session.teacher.name} />
                                            <AvatarFallback>{getInitials(session.teacher.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t('sessions.teacher')}</p>
                                            <p className="text-sm font-medium">{session.teacher.name}</p>
                                        </div>
                                    </div>
                                    <Link href={`/offers/${session.offer.slug}`} className="text-sm text-emerald-700 hover:underline dark:text-emerald-300">
                                        {session.offer.title}
                                    </Link>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {session.meeting_url && session.status === 'scheduled' && attendance_status === 'enrolled' && (
                                        <Button asChild>
                                            <a href={session.meeting_url} target="_blank" rel="noreferrer">
                                                <ExternalLink />
                                                {t('sessions.open_meeting')}
                                            </a>
                                        </Button>
                                    )}
                                    {session.conversation_id && (
                                        <Button variant="outline" asChild>
                                            <Link href={`/messages/${session.conversation_id}`}>
                                                {t('messages.open_session_conversation')}
                                            </Link>
                                        </Button>
                                    )}
                                    {review.can_review && (
                                        <Button asChild>
                                            <Link href={`/my-sessions/${session.id}/review`}>
                                                <Star />
                                                {t('reviews.leave_review')}
                                            </Link>
                                        </Button>
                                    )}
                                    {review.submitted && (
                                        <Badge variant="outline" className="h-10 px-3 py-2">
                                            <Star className="mr-1 size-3 fill-current text-amber-500" />
                                            {t('reviews.review_submitted')}
                                        </Badge>
                                    )}
                                    {can_cancel && (
                                        <Button variant="outline" onClick={() => router.patch(`/my-sessions/${session.id}/cancel`, {}, { preserveScroll: true })}>
                                            <XCircle />
                                            {t('sessions.cancel_participation')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <ContextualHelp title={t('sessions.my_help_title')}>
                    {t('sessions.my_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Empty({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {children}
        </div>
    );
}

MySessions.layout = {
    breadcrumbs: [
        {
            title: 'navigation.my_sessions',
            href: '/my-sessions',
        },
    ],
};

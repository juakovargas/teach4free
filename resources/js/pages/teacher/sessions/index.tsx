import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Attendee = {
    id: number;
    status: string;
    user: { name: string; email: string; avatar?: string | null };
};

type Session = {
    id: number;
    title: string;
    starts_at: string | null;
    ends_at: string | null;
    timezone: string;
    capacity: number;
    status: string;
    meeting_tool: string;
    enrolled_attendees_count: number;
    offer: { title: string; slug: string };
    attendees: Attendee[];
};

type Props = {
    sessions: Session[];
};

export default function TeacherSessions({ sessions }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };

    return (
        <>
            <Head title={t('sessions.teacher_meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <CalendarCheck className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('sessions.teacher_title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('sessions.teacher_intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-4">
                    {sessions.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {t('sessions.empty_teacher')}
                        </div>
                    )}
                    {sessions.map((session) => <SessionCard key={session.id} session={session} />)}
                </section>

                <ContextualHelp title={t('sessions.teacher_help_title')}>
                    {t('sessions.teacher_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function SessionCard({ session }: { session: Session }) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const cancelForm = useForm({ cancellation_reason: '' });
    const actionable = session.status === 'scheduled';

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
                <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        <Badge>{t(`session_statuses.${session.status}`)}</Badge>
                        <Badge variant="outline">{t('sessions.capacity_value', { count: session.capacity })}</Badge>
                        <Badge variant="outline">{t('sessions.attendee_count', { count: session.enrolled_attendees_count })}</Badge>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{session.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {new Date(session.starts_at ?? '').toLocaleString()} - {new Date(session.ends_at ?? '').toLocaleString()} / {session.timezone}
                        </p>
                    </div>
                    <Link href={`/offers/${session.offer.slug}`} className="text-sm text-emerald-700 hover:underline dark:text-emerald-300">
                        {session.offer.title}
                    </Link>
                    <div className="grid gap-2">
                        {session.attendees.map((attendee) => (
                            <div key={attendee.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-2 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-8">
                                        <AvatarImage src={attendee.user.avatar ?? undefined} alt={attendee.user.name} />
                                        <AvatarFallback>{getInitials(attendee.user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{attendee.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{attendee.user.email}</p>
                                    </div>
                                </div>
                                <Badge variant="outline">{t(`attendee_statuses.${attendee.status}`)}</Badge>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid content-start gap-3">
                    {actionable && (
                        <>
                            <Button onClick={() => router.patch(`/teacher/sessions/${session.id}/complete`, {}, { preserveScroll: true })}>
                                <CheckCircle2 />
                                {t('sessions.mark_completed')}
                            </Button>
                            <Button variant="outline" onClick={() => router.patch(`/teacher/sessions/${session.id}/no-show`, {}, { preserveScroll: true })}>
                                <XCircle />
                                {t('sessions.mark_no_show')}
                            </Button>
                            <form
                                className="grid gap-2"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    cancelForm.patch(`/teacher/sessions/${session.id}/cancel`, { preserveScroll: true });
                                }}
                            >
                                <Input value={cancelForm.data.cancellation_reason} onChange={(event) => cancelForm.setData('cancellation_reason', event.target.value)} placeholder={t('sessions.cancellation_reason')} />
                                {cancelForm.errors.cancellation_reason && <p className="text-sm text-destructive">{cancelForm.errors.cancellation_reason}</p>}
                                <Button variant="outline" disabled={cancelForm.processing}>
                                    <XCircle />
                                    {t('sessions.cancel_session')}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

TeacherSessions.layout = {
    breadcrumbs: [
        {
            title: 'navigation.teacher_sessions',
            href: '/teacher/sessions',
        },
    ],
};

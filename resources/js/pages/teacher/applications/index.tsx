import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarPlus, CheckCircle2, Inbox, XCircle } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { ReactNode } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Application = {
    id: number;
    status: string;
    message: string | null;
    availability_note: string | null;
    preferred_starts_at: string | null;
    preferred_timezone: string | null;
    teacher_response: string | null;
    requested_at: string | null;
    preferred_language: { name: string } | null;
    student: { name: string; email: string; avatar?: string | null };
    conversation?: { id: number } | null;
    offer: {
        title: string;
        slug: string;
        session_type: string;
        max_students: number | null;
        duration_minutes: number;
        meeting_tool: string;
        meeting_url: string | null;
        timezone: string;
        teacher_profile?: {
            default_session_duration_minutes: number;
            max_students_per_session: number;
            meeting_tool: string;
            meeting_url: string | null;
        } | null;
        category: { name: string; color: string | null };
        subject: { name: string } | null;
        languages: { code: string; name: string }[];
    };
};

type Props = {
    applications: Application[];
    offer: { id: number; title: string; slug: string } | null;
};

export default function TeacherApplications({ applications, offer }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    return (
        <>
            <Head title={t('teacher_applications.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Inbox className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {offer ? t('teacher_applications.offer_title', { offer: offer.title }) : t('teacher_applications.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('teacher_applications.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-4">
                    {applications.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {t('teacher_applications.empty')}
                        </div>
                    )}
                    {applications.map((application) => (
                        <ApplicationCard key={application.id} application={application} />
                    ))}
                </section>

                <ContextualHelp title={t('teacher_applications.help_title')}>
                    {t('teacher_applications.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function ApplicationCard({ application }: { application: Application }) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const { data, setData, patch, processing, errors } = useForm({
        teacher_response: application.teacher_response ?? '',
    });
    const scheduleForm = useForm({
        starts_at: toDateTimeLocal(application.preferred_starts_at),
        duration_minutes: String(application.offer.duration_minutes || application.offer.teacher_profile?.default_session_duration_minutes || 60),
        timezone: application.preferred_timezone ?? application.offer.timezone ?? 'Europe/Madrid',
        capacity: String(application.offer.max_students ?? application.offer.teacher_profile?.max_students_per_session ?? 1),
        meeting_tool: application.offer.meeting_tool ?? application.offer.teacher_profile?.meeting_tool ?? 'not_decided',
        meeting_url: application.offer.meeting_url ?? application.offer.teacher_profile?.meeting_url ?? '',
        teacher_response: application.teacher_response ?? '',
    });

    const submit = (event: MouseEvent<HTMLButtonElement>, action: 'accept' | 'reject' | 'cancel') => {
        event.preventDefault();
        patch(`/teacher/applications/${application.id}/${action}`, {
            preserveScroll: true,
        });
    };

    const actionable = ['pending', 'waitlisted'].includes(application.status);
    const cancellable = ['pending', 'waitlisted', 'accepted'].includes(application.status);
    const scheduleable = ['pending', 'waitlisted', 'accepted'].includes(application.status);

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge>{t(`application_statuses.${application.status}`)}</Badge>
                        <Badge variant="outline">{t(`session_types.${application.offer.session_type}`)}</Badge>
                        {application.preferred_language && <Badge variant="outline">{application.preferred_language.name}</Badge>}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">{application.offer.title}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {application.offer.category.name}
                            {application.offer.subject ? ` / ${application.offer.subject.name}` : ''}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                            <AvatarImage src={application.student.avatar ?? undefined} alt={application.student.name} />
                            <AvatarFallback>{getInitials(application.student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-xs text-muted-foreground">{t('teacher_applications.student')}</p>
                            <p className="text-sm font-medium">{application.student.name}</p>
                        </div>
                    </div>
                    {application.message && (
                        <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-950">{application.message}</p>
                    )}
                    {application.availability_note && (
                        <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-950">{application.availability_note}</p>
                    )}
                    {application.preferred_starts_at && (
                        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100">
                            {t('teacher_applications.preferred_time', {
                                time: new Date(application.preferred_starts_at).toLocaleString(),
                                timezone: application.preferred_timezone ?? application.offer.timezone,
                            })}
                        </p>
                    )}
                </div>

                <form className="w-full space-y-3 lg:max-w-sm">
                    <Textarea
                        value={data.teacher_response}
                        onChange={(event) => setData('teacher_response', event.target.value)}
                        placeholder={t('teacher_applications.response_placeholder')}
                    />
                    {errors.teacher_response && <p className="text-sm text-destructive">{errors.teacher_response}</p>}
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/offers/${application.offer.slug}`}>{t('teacher_applications.view_offer')}</Link>
                        </Button>
                        {application.conversation && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/messages/${application.conversation.id}`}>{t('messages.open_conversation')}</Link>
                            </Button>
                        )}
                        {actionable && (
                            <>
                                <Button size="sm" disabled={processing} onClick={(event) => submit(event, 'accept')}>
                                    <CheckCircle2 />
                                    {t('teacher_applications.accept')}
                                </Button>
                                <Button variant="outline" size="sm" disabled={processing} onClick={(event) => submit(event, 'reject')}>
                                    <XCircle />
                                    {t('teacher_applications.reject')}
                                </Button>
                            </>
                        )}
                        {cancellable && (
                            <Button variant="outline" size="sm" disabled={processing} onClick={(event) => submit(event, 'cancel')}>
                                <XCircle />
                                {t('teacher_applications.cancel')}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
            {scheduleable && (
                <form
                    className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    onSubmit={(event) => {
                        event.preventDefault();
                        scheduleForm.post(`/teacher/applications/${application.id}/schedule-session`, { preserveScroll: true });
                    }}
                >
                    <div className="flex items-center gap-2">
                        <CalendarPlus className="size-5 text-emerald-700 dark:text-emerald-300" />
                        <h3 className="font-semibold">{t('teacher_applications.schedule_session')}</h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        <Field label={t('sessions.starts_at')} error={scheduleForm.errors.starts_at}>
                            <Input type="datetime-local" value={scheduleForm.data.starts_at} onChange={(event) => scheduleForm.setData('starts_at', event.target.value)} />
                        </Field>
                        <Field label={t('sessions.duration_minutes')} error={scheduleForm.errors.duration_minutes}>
                            <Input type="number" min="15" max="240" value={scheduleForm.data.duration_minutes} onChange={(event) => scheduleForm.setData('duration_minutes', event.target.value)} />
                        </Field>
                        <Field label={t('sessions.timezone')} error={scheduleForm.errors.timezone}>
                            <Input value={scheduleForm.data.timezone} onChange={(event) => scheduleForm.setData('timezone', event.target.value)} />
                        </Field>
                        <Field label={t('sessions.capacity')} error={scheduleForm.errors.capacity}>
                            <Input type="number" min="1" max="500" value={scheduleForm.data.capacity} onChange={(event) => scheduleForm.setData('capacity', event.target.value)} />
                        </Field>
                        <Field label={t('sessions.meeting_tool')} error={scheduleForm.errors.meeting_tool}>
                            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={scheduleForm.data.meeting_tool} onChange={(event) => scheduleForm.setData('meeting_tool', event.target.value)}>
                                {['not_decided', 'google_meet', 'jitsi', 'zoom', 'discord', 'microsoft_teams', 'custom'].map((tool) => (
                                    <option key={tool} value={tool}>{t(`meeting_tools.${tool}`)}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label={t('sessions.meeting_url')} error={scheduleForm.errors.meeting_url}>
                            <Input value={scheduleForm.data.meeting_url} onChange={(event) => scheduleForm.setData('meeting_url', event.target.value)} />
                        </Field>
                    </div>
                    <Field label={t('teacher_applications.response_placeholder')} error={scheduleForm.errors.teacher_response}>
                        <Textarea value={scheduleForm.data.teacher_response} onChange={(event) => scheduleForm.setData('teacher_response', event.target.value)} />
                    </Field>
                    <Button className="w-fit" disabled={scheduleForm.processing}>
                        <CalendarPlus />
                        {t('teacher_applications.schedule_session')}
                    </Button>
                </form>
            )}
        </article>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function toDateTimeLocal(value: string | null): string {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    return date.toISOString().slice(0, 16);
}

TeacherApplications.layout = {
    breadcrumbs: [
        {
            title: 'navigation.requests_to_my_offers',
            href: '/teacher/applications',
        },
    ],
};

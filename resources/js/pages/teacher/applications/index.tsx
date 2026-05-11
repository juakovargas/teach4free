import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Inbox, XCircle } from 'lucide-react';
import type { MouseEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Application = {
    id: number;
    status: string;
    message: string | null;
    availability_note: string | null;
    teacher_response: string | null;
    requested_at: string | null;
    preferred_language: { name: string } | null;
    student: { name: string; email: string; avatar?: string | null };
    offer: {
        title: string;
        slug: string;
        session_type: string;
        max_students: number | null;
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

    const submit = (event: MouseEvent<HTMLButtonElement>, action: 'accept' | 'reject' | 'cancel') => {
        event.preventDefault();
        patch(`/teacher/applications/${application.id}/${action}`, {
            preserveScroll: true,
        });
    };

    const actionable = ['pending', 'waitlisted'].includes(application.status);
    const cancellable = ['pending', 'waitlisted', 'accepted'].includes(application.status);

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
        </article>
    );
}

TeacherApplications.layout = {
    breadcrumbs: [
        {
            title: 'navigation.requests_to_my_offers',
            href: '/teacher/applications',
        },
    ],
};

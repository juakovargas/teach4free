import { Head, Link, usePage } from '@inertiajs/react';
import { Clock, ExternalLink, Inbox, XCircle } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Application = {
    id: number;
    status: string;
    message: string | null;
    availability_note: string | null;
    teacher_response: string | null;
    requested_at: string | null;
    accepted_at: string | null;
    rejected_at: string | null;
    cancelled_at: string | null;
    preferred_language: { name: string } | null;
    can_cancel: boolean;
    offer: {
        title: string;
        slug: string;
        session_type: string;
        meeting_tool: string;
        meeting_url: string | null;
        duration_minutes: number;
        timezone: string;
        teacher: { name: string; email: string; avatar?: string | null };
        category: { name: string; color: string | null };
        subject: { name: string } | null;
        languages: { code: string; name: string }[];
    };
};

type Props = {
    applications: Application[];
};

export default function MyApplications({ applications }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const { flash } = usePage().props;

    return (
        <>
            <Head title={t('applications.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Inbox className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('applications.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('applications.intro')}</p>
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
                            {t('applications.empty')}
                        </div>
                    )}
                    {applications.map((application) => (
                        <article key={application.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge>{t(`application_statuses.${application.status}`)}</Badge>
                                        <Badge variant="outline">{t(`session_types.${application.offer.session_type}`)}</Badge>
                                        {application.preferred_language && (
                                            <Badge variant="outline">{application.preferred_language.name}</Badge>
                                        )}
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
                                            <AvatarImage src={application.offer.teacher.avatar ?? undefined} alt={application.offer.teacher.name} />
                                            <AvatarFallback>{getInitials(application.offer.teacher.name)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{t('applications.teacher')}</p>
                                            <p className="text-sm font-medium">{application.offer.teacher.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 md:justify-end">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/offers/${application.offer.slug}`}>
                                            {t('applications.view_offer')}
                                        </Link>
                                    </Button>
                                    {application.can_cancel && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link
                                                href={`/my-applications/${application.id}/cancel`}
                                                method="patch"
                                                as="button"
                                                preserveScroll
                                            >
                                                <XCircle />
                                                {t('applications.cancel_application')}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 text-sm md:grid-cols-3">
                                <Info label={t('applications.requested_at')} value={formatDate(application.requested_at)} />
                                <Info label={t('applications.meeting_tool')} value={t(`meeting_tools.${application.offer.meeting_tool}`)} />
                                <Info label={t('applications.timezone')} value={application.offer.timezone} />
                            </div>

                            {application.message && (
                                <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground dark:bg-slate-950">
                                    {application.message}
                                </p>
                            )}
                            {application.teacher_response && (
                                <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-100">
                                    {application.teacher_response}
                                </p>
                            )}
                            {application.offer.meeting_url && (
                                <Button className="mt-4" asChild>
                                    <a href={application.offer.meeting_url} target="_blank" rel="noreferrer">
                                        <ExternalLink />
                                        {t('applications.open_meeting')}
                                    </a>
                                </Button>
                            )}
                        </article>
                    ))}
                </section>

                <ContextualHelp title={t('applications.help_title')}>
                    {t('applications.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 flex items-center gap-1 font-medium">
                <Clock className="size-3 text-muted-foreground" />
                {value}
            </p>
        </div>
    );
}

function formatDate(value: string | null): string {
    return value ? new Date(value).toLocaleString() : '-';
}

MyApplications.layout = {
    breadcrumbs: [
        {
            title: 'navigation.my_applications',
            href: '/my-applications',
        },
    ],
};

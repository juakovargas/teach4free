import { Head, Link } from '@inertiajs/react';
import {
    BookOpenCheck,
    FileText,
    Globe2,
    Inbox,
    Languages,
    Presentation,
    Settings2,
} from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard } from '@/routes';

type Summary = {
    preferred_locale: string;
    timezone: string;
    language_count: number;
    teaching_offers_count: number;
    pending_applications_count: number;
    accepted_applications_count: number;
    waitlisted_applications_count: number;
    requests_to_my_offers_count: number;
    unread_notifications_count: number;
    student_status: 'active' | 'inactive';
    teacher_status: 'active' | 'paused' | 'not_activated';
    teacher_accepting_requests: boolean;
};

type Props = {
    summary: Summary;
};

export default function Dashboard({ summary }: Props) {
    const { t, locales } = useTranslation();
    const preferredLocale =
        locales.find((locale) => locale.code === summary.preferred_locale)
            ?.name ?? summary.preferred_locale;

    const cards = [
        {
            title: t('dashboard.preferences'),
            body: t('dashboard.preferences_body', {
                locale: preferredLocale,
                timezone: summary.timezone,
            }),
            status: preferredLocale,
            href: '/profile/preferences',
            icon: Settings2,
        },
        {
            title: t('dashboard.learning_profile'),
            body: t('dashboard.learning_profile_body'),
            status: t(`statuses.${summary.student_status}`),
            href: '/profile/student',
            icon: BookOpenCheck,
        },
        {
            title: t('dashboard.teacher_profile'),
            body: summary.teacher_accepting_requests
                ? t('dashboard.teacher_accepting')
                : t('dashboard.teacher_profile_body'),
            status: t(`statuses.${summary.teacher_status}`),
            href: '/profile/teacher',
            icon: Presentation,
        },
        {
            title: t('dashboard.languages'),
            body: t('dashboard.languages_body'),
            status: t('dashboard.languages_count', {
                count: summary.language_count,
            }),
            href: '/profile/preferences',
            icon: Languages,
        },
        {
            title: t('dashboard.teaching_offers'),
            body: t('dashboard.teaching_offers_body'),
            status: t('dashboard.teaching_offers_count', {
                count: summary.teaching_offers_count,
            }),
            href: '/teacher/offers',
            icon: FileText,
        },
        {
            title: t('dashboard.my_applications'),
            body: t('dashboard.my_applications_body', {
                pending: summary.pending_applications_count,
                accepted: summary.accepted_applications_count,
                waitlisted: summary.waitlisted_applications_count,
            }),
            status: t('dashboard.pending_applications_count', {
                count: summary.pending_applications_count,
            }),
            href: '/my-applications',
            icon: Inbox,
        },
        {
            title: t('dashboard.requests_to_my_offers'),
            body: t('dashboard.requests_to_my_offers_body'),
            status: t('dashboard.requests_to_my_offers_count', {
                count: summary.requests_to_my_offers_count,
            }),
            href: '/teacher/applications',
            icon: Inbox,
        },
        {
            title: t('dashboard.notifications'),
            body: t('dashboard.notifications_body'),
            status: t('dashboard.unread_notifications_count', {
                count: summary.unread_notifications_count,
            }),
            href: '/notifications',
            icon: Inbox,
        },
    ];

    return (
        <>
            <Head title={t('dashboard.meta_title')} />
            <div className="space-y-8 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Globe2 className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {t('dashboard.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('dashboard.intro')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                        <article
                            key={card.title}
                            className="flex min-h-52 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <card.icon className="size-5 text-emerald-700 dark:text-emerald-300" />
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                    {card.status}
                                </span>
                            </div>
                            <h2 className="text-base font-semibold">
                                {card.title}
                            </h2>
                            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                                {card.body}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-5 w-fit"
                                asChild
                            >
                                <Link href={card.href}>
                                    {t('dashboard.open_card')}
                                </Link>
                            </Button>
                        </article>
                    ))}
                </section>

                <ContextualHelp title={t('dashboard.help_title')}>
                    {t('dashboard.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'navigation.dashboard',
            href: dashboard(),
        },
    ],
};

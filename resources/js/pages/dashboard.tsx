import { Head, Link } from '@inertiajs/react';
import {
    BookOpenCheck,
    CalendarClock,
    CalendarDays,
    FileText,
    Globe2,
    Inbox,
    Languages,
    Presentation,
    Settings2,
    ShieldAlert,
    Star,
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
    teacher_availability_count: number;
    upcoming_student_sessions_count: number;
    upcoming_teacher_sessions_count: number;
    pending_applications_count: number;
    accepted_applications_count: number;
    waitlisted_applications_count: number;
    requests_to_my_offers_count: number;
    unread_notifications_count: number;
    open_reports_count: number;
    reports_with_response_count: number;
    reviewable_sessions_count: number;
    reviews_submitted_count: number;
    teacher_average_rating: number | null;
    teacher_published_reviews_count: number;
    teacher_pending_review_responses_count: number;
    teacher_hidden_reviews_count: number;
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
            title: t('dashboard.my_availability'),
            body: t('dashboard.my_availability_body'),
            status: t('dashboard.availability_blocks_count', {
                count: summary.teacher_availability_count,
            }),
            href: '/teacher/availability',
            icon: CalendarClock,
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
            title: t('dashboard.my_sessions'),
            body: t('dashboard.my_sessions_body_with_reviews', {
                reviews: summary.reviewable_sessions_count,
            }),
            status: t('dashboard.upcoming_sessions_count', { count: summary.upcoming_student_sessions_count }),
            href: '/my-sessions',
            icon: CalendarDays,
        },
        {
            title: t('dashboard.reviews_to_write'),
            body: t('dashboard.reviews_to_write_body', {
                submitted: summary.reviews_submitted_count,
            }),
            status: t('dashboard.reviewable_sessions_count', {
                count: summary.reviewable_sessions_count,
            }),
            href: '/my-sessions',
            icon: Star,
        },
        {
            title: t('dashboard.teacher_sessions'),
            body: t('dashboard.teacher_sessions_body'),
            status: t('dashboard.upcoming_sessions_count', {
                count: summary.upcoming_teacher_sessions_count,
            }),
            href: '/teacher/sessions',
            icon: CalendarDays,
        },
        {
            title: t('dashboard.teacher_reviews'),
            body: t('dashboard.teacher_reviews_body', {
                pending: summary.teacher_pending_review_responses_count,
            }),
            status:
                summary.teacher_published_reviews_count > 0
                    ? t('dashboard.teacher_rating_status', {
                          rating: summary.teacher_average_rating ?? '-',
                          count: summary.teacher_published_reviews_count,
                      })
                    : t('reviews.no_reviews_short'),
            href: '/teacher/reviews',
            icon: Star,
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
            title: t('dashboard.notification_preferences'),
            body: t('dashboard.notification_preferences_body'),
            status: t('dashboard.external_email_controls'),
            href: '/profile/notification-preferences',
            icon: Settings2,
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
        {
            title: t('dashboard.my_reports'),
            body: t('dashboard.my_reports_body', {
                responses: summary.reports_with_response_count,
            }),
            status: t('dashboard.open_reports_count', {
                count: summary.open_reports_count,
            }),
            href: '/my-reports',
            icon: ShieldAlert,
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

import { Head } from '@inertiajs/react';
import {
    Flag,
    GraduationCap,
    Languages,
    Presentation,
    ShieldQuestion,
    UserCheck,
    Users,
} from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { useTranslation } from '@/hooks/use-translation';

type Stats = {
    total_users: number;
    active_students: number;
    active_teachers: number;
    teaching_offers: number;
    active_teaching_offers: number;
    applications: number;
    pending_applications: number;
    categories: number;
    subjects: number;
    active_languages: number;
    reports: number;
    reviews: number;
    google_users: number;
    pending_teacher_verifications: number;
};

type Props = {
    stats: Stats;
};

export default function AdminDashboard({ stats }: Props) {
    const { t } = useTranslation();

    const cards = [
        {
            label: t('admin.total_users'),
            value: stats.total_users,
            icon: Users,
        },
        {
            label: t('admin.active_students'),
            value: stats.active_students,
            icon: GraduationCap,
        },
        {
            label: t('admin.active_teachers'),
            value: stats.active_teachers,
            icon: Presentation,
        },
        {
            label: t('admin.teaching_offers'),
            value: stats.teaching_offers,
            icon: Flag,
        },
        {
            label: t('admin.active_teaching_offers'),
            value: stats.active_teaching_offers,
            icon: Flag,
        },
        {
            label: t('admin.applications'),
            value: stats.applications,
            icon: UserCheck,
        },
        {
            label: t('admin.pending_applications'),
            value: stats.pending_applications,
            icon: ShieldQuestion,
        },
        {
            label: t('admin.categories'),
            value: stats.categories,
            icon: Flag,
        },
        {
            label: t('admin.subjects'),
            value: stats.subjects,
            icon: GraduationCap,
        },
        {
            label: t('admin.active_languages'),
            value: stats.active_languages,
            icon: Languages,
        },
        {
            label: t('admin.reports'),
            value: stats.reports,
            icon: ShieldQuestion,
        },
        {
            label: t('admin.reviews'),
            value: stats.reviews,
            icon: UserCheck,
        },
        {
            label: t('admin.google_users'),
            value: stats.google_users,
            icon: UserCheck,
        },
        {
            label: t('admin.pending_teacher_verifications'),
            value: stats.pending_teacher_verifications,
            icon: ShieldQuestion,
        },
    ];

    return (
        <>
            <Head title={t('admin.meta_title')} />
            <div className="space-y-8 p-4 sm:p-6">
                <section className="rounded-lg border border-amber-200 bg-white p-6 shadow-xs dark:border-amber-900/60 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <div className="rounded-lg bg-amber-100 p-3 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                            <Flag className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {t('admin.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin.intro')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {cards.map((stat) => (
                        <article
                            key={stat.label}
                            className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {stat.label}
                                </p>
                                <stat.icon className="size-5 text-emerald-700 dark:text-emerald-300" />
                            </div>
                            <p className="mt-5 text-3xl font-semibold">
                                {stat.value}
                            </p>
                        </article>
                    ))}
                </section>

                <ContextualHelp title={t('admin.help_title')}>
                    {t('admin.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'navigation.admin',
            href: '/admin',
        },
    ],
};

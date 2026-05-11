import { Head, Link, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    CheckCircle2,
    Globe2,
    GraduationCap,
    HandHeart,
    Languages,
    Star,
    Users,
} from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { login, register } from '@/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Welcome() {
    const { t } = useTranslation();
    const { auth } = usePage().props as PageProps;

    const principles = [
        t('home.no_payments'),
        t('home.no_credits'),
        t('home.no_commissions'),
    ];

    const features = [
        {
            icon: Star,
            text: t('home.reputation'),
        },
        {
            icon: Languages,
            text: t('home.multilingual'),
        },
        {
            icon: CalendarClock,
            text: t('home.teacher_availability'),
        },
        {
            icon: Users,
            text: t('home.student_applications'),
        },
    ];

    return (
        <>
            <Head title={t('home.meta_title')} />

            <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
                <div className="flex flex-col justify-center">
                    <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-medium text-emerald-800 shadow-xs dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-200">
                        <HandHeart className="size-4" />
                        {t('home.eyebrow')}
                    </p>
                    <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                        {t('home.title')}
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                        {t('home.intro')}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button size="lg" asChild>
                            <Link href="/offers">
                                {t('actions.start_learning')}
                            </Link>
                        </Button>
                        <Button size="lg" variant="secondary" asChild>
                            <Link href={auth.user ? '/profile/teacher' : register()}>
                                {t('actions.start_teaching')}
                            </Link>
                        </Button>
                        <Button size="lg" variant="ghost" asChild>
                            <Link href={login()}>{t('navigation.login')}</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                            <Link href={register()}>
                                {t('navigation.register')}
                            </Link>
                        </Button>
                    </div>

                    <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                        {principles.map((principle) => (
                            <div
                                key={principle}
                                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                            >
                                <CheckCircle2 className="size-4 text-emerald-600" />
                                {principle}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-emerald-950/5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">
                                    {t('home.board_title')}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Teach4Free
                                </p>
                            </div>
                            <Globe2 className="size-5 text-cyan-600" />
                        </div>
                        <div className="grid gap-3">
                            <div className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-900/60 dark:bg-slate-900">
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="size-5 text-emerald-700 dark:text-emerald-300" />
                                    <p className="font-medium">
                                        {t('home.board_learning')}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-cyan-200 bg-white p-4 dark:border-cyan-900/60 dark:bg-slate-900">
                                <div className="flex items-center gap-3">
                                    <CalendarClock className="size-5 text-cyan-700 dark:text-cyan-300" />
                                    <p className="font-medium">
                                        {t('home.board_teaching')}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg border border-amber-200 bg-white p-4 dark:border-amber-900/60 dark:bg-slate-900">
                                <div className="flex items-center gap-3">
                                    <Star className="size-5 text-amber-600 dark:text-amber-300" />
                                    <p className="font-medium">
                                        {t('home.board_trust')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-14 sm:px-6 lg:grid-cols-4 lg:px-8">
                {features.map((feature) => (
                    <div
                        key={feature.text}
                        className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                        <feature.icon className="mb-4 size-5 text-emerald-700 dark:text-emerald-300" />
                        <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {feature.text}
                        </p>
                    </div>
                ))}
            </section>

            <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
                <ContextualHelp title={t('home.help_title')}>
                    {t('home.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

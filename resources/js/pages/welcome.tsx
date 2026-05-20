import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    CheckCircle2,
    Globe2,
    GraduationCap,
    HandHeart,
    Languages,
    MessageCircleHeart,
    Search,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';
import {
    CTASection,
    EmptyState,
    FeatureCard,
    OfferCard,
    PathCard,
    PublicSection,
    StatCard,
    TeacherCard,
} from '@/components/public/public-identity';
import type {
    PublicLanguage,
    PublicOffer,
    PublicTeacher,
} from '@/components/public/public-identity';
import { SeoHead } from '@/components/seo-head';
import type { SeoHeadProps } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Stats = {
    teachers: number;
    students: number;
    offers: number;
    languages: number;
    countries: number;
    open_sessions: number;
};

type PageProps = {
    currentLanguage: PublicLanguage | null;
    featuredTeachers: PublicTeacher[];
    featuredOffers: PublicOffer[];
    openOffers: PublicOffer[];
    stats: Stats;
    languageOfferUrl: string;
    allOffersUrl: string;
    startTeachingUrl: string;
    seo: SeoHeadProps;
};

export default function Welcome() {
    const { t } = useTranslation();
    const {
        currentLanguage,
        featuredTeachers,
        featuredOffers,
        openOffers,
        stats,
        languageOfferUrl,
        allOffersUrl,
        startTeachingUrl,
        seo,
    } = usePage().props as unknown as PageProps;

    const trustItems = [
        { icon: ShieldCheck, label: t('home.trust_100_free') },
        { icon: Languages, label: t('home.trust_multilingual_teachers') },
        { icon: Star, label: t('home.trust_community_reputation') },
        { icon: CalendarClock, label: t('home.trust_flexible_availability') },
        { icon: Globe2, label: t('home.trust_open_public_sessions') },
        { icon: MessageCircleHeart, label: t('home.trust_one_to_one_mentoring') },
    ];

    const learnerSteps = [
        t('home.learner_step_1'),
        t('home.learner_step_2'),
        t('home.learner_step_3'),
        t('home.learner_step_4'),
    ];

    const teacherSteps = [
        t('home.teacher_step_1'),
        t('home.teacher_step_2'),
        t('home.teacher_step_3'),
        t('home.teacher_step_4'),
    ];

    const statsCards = [
        { label: t('home.stats_teachers'), value: stats.teachers, icon: GraduationCap },
        { label: t('home.stats_students'), value: stats.students, icon: Users },
        { label: t('home.stats_offers'), value: stats.offers, icon: Sparkles },
        { label: t('home.stats_languages'), value: stats.languages, icon: Languages },
        { label: t('home.stats_countries'), value: stats.countries, icon: Globe2 },
        { label: t('home.stats_open_sessions'), value: stats.open_sessions, icon: CalendarClock },
    ];

    const currentLanguageName =
        currentLanguage?.native_name ??
        currentLanguage?.name ??
        t('home.default_language_name');

    return (
        <>
            <SeoHead {...seo} />

            <div className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_34rem),radial-gradient(circle_at_70%_10%,rgba(249,115,22,0.14),transparent_28rem),linear-gradient(180deg,#fffaf3_0%,#f8fbf8_42%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.20),transparent_32rem),radial-gradient(circle_at_75%_0%,rgba(217,119,6,0.18),transparent_28rem),linear-gradient(180deg,#07140f_0%,#0f172a_54%,#020617_100%)]">
                <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
                    <div className="relative z-10 flex flex-col justify-center">
                        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200/80 bg-white/80 px-3 py-1 text-sm font-medium text-emerald-900 shadow-xs backdrop-blur dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
                            <HandHeart className="size-4" />
                            {t('home.hero_eyebrow')}
                        </p>
                        <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
                            {t('home.hero_title')}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700 dark:text-slate-300">
                            {t('home.hero_intro')}
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button size="lg" asChild>
                                <Link href="/offers">
                                    <Search />
                                    {t('home.find_classes_cta')}
                                </Link>
                            </Button>
                            <Button size="lg" variant="secondary" asChild>
                                <Link href={startTeachingUrl}>
                                    <Sparkles />
                                    {t('home.start_teaching_free_cta')}
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                            {[
                                t('home.no_payments'),
                                t('home.no_credits'),
                                t('home.no_commissions'),
                            ].map((principle) => (
                                <div
                                    key={principle}
                                    className="flex items-center gap-2 rounded-lg border border-white/80 bg-white/75 px-3 py-2 text-sm font-semibold text-slate-800 shadow-xs backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
                                >
                                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-300" />
                                    {principle}
                                </div>
                            ))}
                        </div>
                    </div>

                    <KnowledgeConstellation />
                </section>

                <section className="mx-auto grid max-w-7xl gap-3 px-4 pb-12 sm:px-6 md:grid-cols-3 lg:grid-cols-6 lg:px-8">
                    {trustItems.map((item) => (
                        <FeatureCard key={item.label} icon={item.icon}>
                            {item.label}
                        </FeatureCard>
                    ))}
                </section>
            </div>

            <main className="bg-white dark:bg-slate-950">
                <PublicSection
                    eyebrow={t('home.featured_teachers_eyebrow')}
                    title={t('home.featured_teachers_title')}
                    intro={t('home.featured_teachers_intro')}
                >
                    {featuredTeachers.length === 0 ? (
                        <EmptyState title={t('home.teachers_empty_title')}>
                            {t('home.teachers_empty_body')}
                        </EmptyState>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {featuredTeachers.map((teacher) => (
                                <TeacherCard key={teacher.id} teacher={teacher} />
                            ))}
                        </div>
                    )}
                </PublicSection>

                <PublicSection
                    eyebrow={t('home.featured_offers_eyebrow')}
                    title={t('home.featured_offers_title')}
                    intro={t('home.featured_offers_intro')}
                    action={
                        <Button variant="outline" asChild>
                            <Link href="/offers">
                                {t('home.view_all_offers')}
                                <ArrowRight />
                            </Link>
                        </Button>
                    }
                >
                    {featuredOffers.length === 0 ? (
                        <EmptyState title={t('home.offers_empty_title')}>
                            {t('home.offers_empty_body')}
                        </EmptyState>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {featuredOffers.map((offer) => (
                                <OfferCard key={offer.id} offer={offer} />
                            ))}
                        </div>
                    )}
                </PublicSection>

                {openOffers.length > 0 && (
                    <PublicSection
                        eyebrow={t('home.open_sessions_eyebrow')}
                        title={t('home.open_sessions_title')}
                        intro={t('home.open_sessions_intro')}
                    >
                        <div className="grid gap-4 md:grid-cols-3">
                            {openOffers.map((offer) => (
                                <OfferCard key={offer.id} offer={offer} compact />
                            ))}
                        </div>
                    </PublicSection>
                )}

                <PublicSection
                    eyebrow={t('home.how_it_works_eyebrow')}
                    title={t('home.how_it_works_title')}
                    intro={t('home.how_it_works_intro')}
                >
                    <div className="grid gap-5 lg:grid-cols-2">
                        <PathCard
                            title={t('home.learners_path_title')}
                            icon={GraduationCap}
                            steps={learnerSteps}
                        />
                        <PathCard
                            title={t('home.teachers_path_title')}
                            icon={HandHeart}
                            steps={teacherSteps}
                        />
                    </div>
                </PublicSection>

                <PublicSection
                    eyebrow={t('home.language_discovery_eyebrow')}
                    title={t('home.language_discovery_title')}
                    intro={t('home.language_discovery_message', {
                        language: currentLanguageName,
                    })}
                >
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-6 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/20">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-base font-semibold text-slate-950 dark:text-white">
                                    {t('home.explore_all_languages')}
                                </p>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300">
                                    {t('home.language_discovery_body')}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button asChild>
                                    <Link href={languageOfferUrl}>
                                        {t('home.view_language_offers')}
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={allOffersUrl}>
                                        {t('home.view_all_offers')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </PublicSection>

                <PublicSection
                    eyebrow={t('home.stats_eyebrow')}
                    title={t('home.stats_title')}
                    intro={t('home.stats_intro')}
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
                        {statsCards.map((stat) => (
                            <StatCard
                                key={stat.label}
                                icon={stat.icon}
                                label={stat.label}
                                value={stat.value}
                            />
                        ))}
                    </div>
                </PublicSection>

                <CTASection
                    eyebrow={t('home.final_cta_eyebrow')}
                    title={t('home.final_cta_title')}
                    intro={t('home.final_cta_intro')}
                    primaryHref="/offers"
                    primaryLabel={t('home.start_learning_free')}
                    secondaryHref={startTeachingUrl}
                    secondaryLabel={t('home.share_what_you_know')}
                />
            </main>
        </>
    );
}

function KnowledgeConstellation() {
    const { t } = useTranslation();

    return (
        <div className="relative min-h-[26rem] rounded-lg border border-white/80 bg-white/65 p-5 shadow-2xl shadow-emerald-950/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
            <div className="absolute inset-6 rounded-lg border border-dashed border-emerald-200/80 dark:border-emerald-700/50" />
            <div className="absolute left-[18%] top-[18%] size-3 rounded-full bg-emerald-500 shadow-[0_0_0_10px_rgba(16,185,129,0.12)]" />
            <div className="absolute right-[22%] top-[28%] size-3 rounded-full bg-amber-500 shadow-[0_0_0_10px_rgba(245,158,11,0.14)]" />
            <div className="absolute bottom-[24%] left-[30%] size-3 rounded-full bg-cyan-500 shadow-[0_0_0_10px_rgba(6,182,212,0.12)]" />
            <div className="absolute right-[18%] bottom-[18%] size-3 rounded-full bg-rose-500 shadow-[0_0_0_10px_rgba(244,63,94,0.12)]" />

            <div className="relative z-10 grid h-full min-h-[24rem] place-items-center">
                <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                        <Globe2 className="size-7" />
                    </div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">
                        {t('home.constellation_title')}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {t('home.constellation_subtitle')}
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {[
                            t('home.constellation_teacher'),
                            t('home.constellation_student'),
                            t('home.constellation_language'),
                            t('home.constellation_topic'),
                        ].map((label) => (
                            <span
                                key={label}
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
                            >
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

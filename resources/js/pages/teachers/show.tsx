import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    Clock,
    Globe2,
    GraduationCap,
    HandHeart,
    Languages,
    MapPin,
    ShieldCheck,
    Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import {
    EmptyState,
    LanguageBadge,
    OfferCard,
} from '@/components/public/public-identity';
import type {
    PublicLanguage,
    PublicOffer,
    PublicTeacher,
} from '@/components/public/public-identity';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Availability = {
    day_of_week: number;
    starts_at: string;
    ends_at: string;
    timezone: string;
    notes: string | null;
};

type Teacher = PublicTeacher & {
    banner: string | null;
    teaching_bio: string | null;
    experience_summary: string | null;
    preferred_teaching_mode: string | null;
    max_students_per_session: number | null;
    default_session_duration_minutes: number | null;
    is_accepting_requests: boolean;
    availability: Availability[];
};

type Props = {
    teacher: Teacher;
    offers: PublicOffer[];
    openOffers: PublicOffer[];
};

export default function TeacherShow({ teacher, offers, openOffers }: Props) {
    const { t } = useTranslation();
    const location = [teacher.city, teacher.country_code].filter(Boolean).join(', ');

    return (
        <>
            <Head title={t('teachers.profile_meta_title', { teacher: teacher.name })} />
            <div className="bg-white dark:bg-slate-950">
                <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                    <Button variant="outline" asChild>
                        <Link href="/teachers">
                            <ArrowLeft />
                            {t('teachers.back_to_teachers')}
                        </Link>
                    </Button>

                    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-emerald-950/5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="relative h-48 sm:h-64">
                            {teacher.banner ? (
                                <img
                                    src={teacher.banner}
                                    alt={t('teachers.banner_alt', {
                                        teacher: teacher.name,
                                    })}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.35),transparent_18rem),radial-gradient(circle_at_82%_10%,rgba(245,158,11,0.30),transparent_18rem),linear-gradient(135deg,#064e3b_0%,#0f766e_48%,#78350f_100%)]">
                                    <div className="h-full w-full opacity-25 [background-image:linear-gradient(90deg,rgba(255,255,255,.45)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.45)_1px,transparent_1px)] [background-size:44px_44px]" />
                                </div>
                            )}
                        </div>
                        <div className="relative px-6 pb-6">
                            <Avatar className="-mt-14 size-28 border-4 border-white shadow-xl dark:border-slate-900">
                                <AvatarImage
                                    src={teacher.avatar ?? undefined}
                                    alt={teacher.name}
                                />
                                <AvatarFallback className="text-2xl">
                                    {teacher.initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl dark:text-white">
                                            {teacher.name}
                                        </h1>
                                        {teacher.is_verified && (
                                            <Badge className="rounded-full bg-emerald-700 text-white hover:bg-emerald-700">
                                                <ShieldCheck className="mr-1 size-3" />
                                                {t('home.teacher_verified')}
                                            </Badge>
                                        )}
                                    </div>
                                    {teacher.headline && (
                                        <p className="mt-3 max-w-3xl text-lg leading-7 text-slate-700 dark:text-slate-300">
                                            {teacher.headline}
                                        </p>
                                    )}
                                    {location && (
                                        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="size-4" />
                                            {location}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <Button asChild>
                                        <Link href={teacher.offers_url}>
                                            <GraduationCap />
                                            {t('teachers.view_free_classes')}
                                        </Link>
                                    </Button>
                                    {offers[0] && (
                                        <Button variant="outline" asChild>
                                            <Link href={offers[0].url}>
                                                <HandHeart />
                                                {t('teachers.apply_to_offer')}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <InfoCard
                            icon={Languages}
                            label={t('teachers.teaching_languages')}
                            value={teacher.languages
                                .map((language) => language.name)
                                .join(', ')}
                        />
                        <InfoCard
                            icon={Users}
                            label={t('teachers.preferred_mode')}
                            value={
                                teacher.preferred_teaching_mode
                                    ? t(`learning_modes.${teacher.preferred_teaching_mode}`)
                                    : t('common.not_applicable')
                            }
                        />
                        <InfoCard
                            icon={Clock}
                            label={t('teachers.default_duration')}
                            value={
                                teacher.default_session_duration_minutes
                                    ? t('offers.duration_value', {
                                          minutes: teacher.default_session_duration_minutes,
                                      })
                                    : t('common.not_applicable')
                            }
                        />
                        <InfoCard
                            icon={CalendarClock}
                            label={t('teachers.active_free_classes')}
                            value={String(teacher.active_offers_count)}
                        />
                    </section>

                    <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                        <article className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {t('teachers.about_teacher')}
                                </h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                                    {teacher.teaching_bio ??
                                        t('teachers.default_teaching_bio')}
                                </p>
                            </div>
                            {teacher.experience_summary && (
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {t('teachers.experience')}
                                    </h2>
                                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                                        {teacher.experience_summary}
                                    </p>
                                </div>
                            )}
                            <div>
                                <h2 className="text-xl font-semibold">
                                    {t('teachers.languages_and_topics')}
                                </h2>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {teacher.languages.map((language: PublicLanguage) => (
                                        <LanguageBadge
                                            key={language.code}
                                            language={language}
                                        />
                                    ))}
                                    {teacher.categories.map((category) => (
                                        <Badge
                                            key={category.slug}
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            {category.name}
                                        </Badge>
                                    ))}
                                    {teacher.subjects.map((subject) => (
                                        <Badge
                                            key={subject.slug}
                                            variant="outline"
                                            className="rounded-full"
                                        >
                                            {subject.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </article>

                        <aside className="space-y-4">
                            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <h2 className="font-semibold">
                                    {t('teachers.availability')}
                                </h2>
                                <div className="mt-3 grid gap-2 text-sm">
                                    {teacher.availability.length === 0 && (
                                        <p className="text-muted-foreground">
                                            {t('teachers.no_availability')}
                                        </p>
                                    )}
                                    {teacher.availability.map((block, index) => (
                                        <div
                                            key={`${block.day_of_week}-${block.starts_at}-${index}`}
                                            className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-950"
                                        >
                                            <div className="flex justify-between gap-3">
                                                <span>
                                                    {t(`weekdays.${block.day_of_week}`)}
                                                </span>
                                                <span>
                                                    {block.starts_at} - {block.ends_at}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {block.timezone}
                                            </p>
                                            {block.notes && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {block.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-5 text-sm leading-6 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/20 dark:text-emerald-100">
                                <Globe2 className="mb-3 size-5" />
                                {t('teachers.free_rule_note')}
                            </div>
                        </aside>
                    </section>

                    {openOffers.length > 0 && (
                        <section className="space-y-6">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                    {t('teachers.open_offers_eyebrow')}
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold">
                                    {t('teachers.open_offers_title')}
                                </h2>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {openOffers.map((offer) => (
                                    <OfferCard key={offer.id} offer={offer} compact />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="space-y-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                {t('teachers.offers_eyebrow')}
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold">
                                {t('teachers.offers_title')}
                            </h2>
                        </div>
                        {offers.length === 0 ? (
                            <EmptyState title={t('teachers.no_offers_title')}>
                                {t('teachers.no_offers_body')}
                            </EmptyState>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {offers.map((offer) => (
                                    <OfferCard key={offer.id} offer={offer} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

function InfoCard({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Icon className="mb-4 size-5 text-emerald-700 dark:text-emerald-300" />
            <p className="text-xs font-medium uppercase text-muted-foreground">
                {label}
            </p>
            <p className="mt-2 text-sm font-semibold">{value}</p>
        </article>
    );
}

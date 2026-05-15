import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarClock,
    Clock,
    Compass,
    MapPin,
    ShieldCheck,
    Star,
} from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export type PublicLanguage = {
    code: string;
    name: string;
    native_name: string;
};

export type PublicReputationSummary = {
    average_rating: number | null;
    published_review_count: number;
    completed_sessions_count: number;
    students_helped_count: number;
    teaching_hours: number;
    cancellation_rate: number;
    no_show_rate: number;
    reliability_label:
        | 'new_teacher'
        | 'excellent'
        | 'reliable'
        | 'needs_attention';
    has_enough_data: boolean;
};

export type PublicTeacher = {
    id: number;
    name: string;
    avatar: string | null;
    initials: string;
    headline: string | null;
    city: string | null;
    country_code: string | null;
    is_verified: boolean;
    active_offers_count: number;
    teaching_bio_excerpt?: string | null;
    languages: PublicLanguage[];
    categories: { name: string; slug: string; color: string | null }[];
    subjects: { name: string; slug: string }[];
    profile_url: string;
    offers_url: string;
    rating_summary?: {
        average: number | null;
        count: number;
    };
    reputation_summary?: PublicReputationSummary;
};

export type PublicOffer = {
    id: number;
    slug: string;
    title: string;
    summary: string;
    level: string;
    teaching_mode: string;
    session_type: string;
    duration_minutes: number;
    availability_summary: string | null;
    teacher: {
        id: number;
        name: string;
        avatar: string | null;
        city: string | null;
        country_code: string | null;
        profile_url?: string | null;
        rating_summary?: {
            average: number | null;
            count: number;
        };
        reputation_summary?: PublicReputationSummary;
    };
    category: { name: string; slug: string; color: string | null };
    subject: { name: string; slug: string } | null;
    languages: PublicLanguage[];
    url: string;
};

const levelStyles: Record<string, string> = {
    beginner: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-100',
    intermediate: 'border-cyan-200 bg-cyan-50 text-cyan-900 dark:border-cyan-900/70 dark:bg-cyan-950/40 dark:text-cyan-100',
    advanced: 'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100',
    mixed: 'border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-900/70 dark:bg-violet-950/40 dark:text-violet-100',
};

const sessionTypeStyles: Record<string, string> = {
    private_request: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    scheduled_group: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/40 dark:text-blue-100',
    open_public: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-100',
};

export function PublicSection({
    eyebrow,
    title,
    intro,
    action,
    children,
}: {
    eyebrow: string;
    title: string;
    intro: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        {eyebrow}
                    </p>
                    <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                        {title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {intro}
                    </p>
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export function FeatureCard({
    icon: Icon,
    children,
}: {
    icon: ComponentType<{ className?: string }>;
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-24 items-center gap-3 rounded-lg border border-white/80 bg-white/75 p-4 text-sm font-semibold text-slate-800 shadow-xs backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-100">
            <Icon className="size-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
            <span>{children}</span>
        </div>
    );
}

export function FreeBadge() {
    const { t } = useTranslation();

    return (
        <Badge className="rounded-full bg-emerald-700 text-white hover:bg-emerald-700">
            {t('offers.free_badge')}
        </Badge>
    );
}

export function LanguageBadge({ language }: { language: PublicLanguage }) {
    return (
        <Badge variant="secondary" className="rounded-full">
            {language.name}
        </Badge>
    );
}

export function LevelBadge({ level }: { level: string }) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={cn('rounded-full', levelStyles[level])}
        >
            {t(`offer_levels.${level}`)}
        </Badge>
    );
}

export function TeachingModeBadge({ mode }: { mode: string }) {
    const { t } = useTranslation();

    return (
        <Badge variant="outline" className="rounded-full">
            {t(`learning_modes.${mode}`)}
        </Badge>
    );
}

export function SessionTypeBadge({ sessionType }: { sessionType: string }) {
    const { t } = useTranslation();

    return (
        <Badge
            variant="outline"
            className={cn('rounded-full', sessionTypeStyles[sessionType])}
        >
            {t(`session_types.${sessionType}`)}
        </Badge>
    );
}

export function TeacherCard({ teacher }: { teacher: PublicTeacher }) {
    const { t } = useTranslation();

    return (
        <article className="group flex min-h-72 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Avatar className="size-12 border border-white shadow-md">
                        <AvatarImage
                            src={teacher.avatar ?? undefined}
                            alt={teacher.name}
                        />
                        <AvatarFallback>{teacher.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-950 dark:text-white">
                                {teacher.name}
                            </h3>
                            {teacher.is_verified && (
                                <ShieldCheck
                                    className="size-4 text-emerald-600"
                                    aria-label={t('home.teacher_verified')}
                                />
                            )}
                        </div>
                        {(teacher.city || teacher.country_code) && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="size-3" />
                                {[teacher.city, teacher.country_code]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                        )}
                        {teacher.rating_summary && teacher.rating_summary.count > 0 && (
                            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                <Star className="size-3 fill-current" />
                                {t('reviews.rating_summary_short', {
                                    rating: teacher.rating_summary.average ?? '-',
                                    count: teacher.rating_summary.count,
                                })}
                            </p>
                        )}
                    </div>
                </div>
                <FreeBadge />
            </div>
            {teacher.reputation_summary && (
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="rounded-full">
                        {t(
                            `reputation.public_labels.${teacher.reputation_summary.reliability_label}`,
                        )}
                    </Badge>
                    {teacher.reputation_summary.completed_sessions_count > 0 && (
                        <Badge variant="secondary" className="rounded-full">
                            {t('reputation.card_completed_sessions', {
                                count: teacher.reputation_summary.completed_sessions_count,
                            })}
                        </Badge>
                    )}
                    {teacher.reputation_summary.students_helped_count > 0 && (
                        <Badge variant="secondary" className="rounded-full">
                            {t('reputation.card_students_helped', {
                                count: teacher.reputation_summary.students_helped_count,
                            })}
                        </Badge>
                    )}
                </div>
            )}
            <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {teacher.headline ?? teacher.teaching_bio_excerpt ?? t('home.teacher_default_headline')}
            </p>
            {teacher.teaching_bio_excerpt && teacher.headline && (
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {teacher.teaching_bio_excerpt}
                </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
                {teacher.languages.map((language) => (
                    <LanguageBadge key={language.code} language={language} />
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
            <div className="mt-auto pt-5">
                <p className="mb-3 text-xs font-medium text-muted-foreground">
                    {t('home.teacher_offers_count', {
                        count: teacher.active_offers_count,
                    })}
                </p>
                <Button variant="outline" className="w-full justify-between" asChild>
                    <Link href={teacher.profile_url}>
                        {t('teachers.view_profile')}
                        <ArrowRight className="transition group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>
        </article>
    );
}

export function OfferCard({
    offer,
    compact = false,
}: {
    offer: PublicOffer;
    compact?: boolean;
}) {
    const { t } = useTranslation();
    const getInitials = useInitials();

    return (
        <article
            className={cn(
                'group flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-950/10 dark:border-slate-800 dark:bg-slate-900',
                compact ? 'min-h-72' : 'min-h-80',
            )}
        >
            <div className="mb-4 flex items-center justify-between gap-3">
                <Link
                    href={offer.teacher.profile_url ?? `/offers?teacher=${offer.teacher.id}`}
                    className="flex min-w-0 items-center gap-3 rounded-md outline-hidden transition hover:text-emerald-800 focus-visible:ring-2 focus-visible:ring-ring dark:hover:text-emerald-200"
                >
                    <Avatar className="size-10">
                        <AvatarImage
                            src={offer.teacher.avatar ?? undefined}
                            alt={offer.teacher.name}
                        />
                        <AvatarFallback>
                            {getInitials(offer.teacher.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                            {offer.teacher.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {offer.category.name}
                        </p>
                        {offer.teacher.rating_summary && offer.teacher.rating_summary.count > 0 && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                <Star className="size-3 fill-current" />
                                {t('reviews.rating_summary_short', {
                                    rating: offer.teacher.rating_summary.average ?? '-',
                                    count: offer.teacher.rating_summary.count,
                                })}
                            </p>
                        )}
                    </div>
                </Link>
                <FreeBadge />
            </div>
            {offer.teacher.reputation_summary && (
                <div className="-mt-1 mb-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full text-[0.7rem]">
                        {t(
                            `reputation.public_labels.${offer.teacher.reputation_summary.reliability_label}`,
                        )}
                    </Badge>
                    {offer.teacher.reputation_summary.completed_sessions_count > 0 && (
                        <Badge variant="secondary" className="rounded-full text-[0.7rem]">
                            {t('reputation.card_completed_sessions', {
                                count: offer.teacher.reputation_summary.completed_sessions_count,
                            })}
                        </Badge>
                    )}
                </div>
            )}
            <div className="mb-3 flex flex-wrap gap-2">
                {offer.subject && (
                    <Badge variant="outline" className="rounded-full">
                        {offer.subject.name}
                    </Badge>
                )}
            </div>
            <h3 className="text-lg font-semibold leading-snug text-slate-950 dark:text-white">
                {offer.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                {offer.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
                <LevelBadge level={offer.level} />
                <TeachingModeBadge mode={offer.teaching_mode} />
                <SessionTypeBadge sessionType={offer.session_type} />
                {offer.languages.map((language) => (
                    <LanguageBadge key={language.code} language={language} />
                ))}
            </div>
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                    <Clock className="size-4" />
                    {t('offers.duration_value', {
                        minutes: offer.duration_minutes,
                    })}
                </span>
                {offer.availability_summary && (
                    <span className="flex items-center gap-2">
                        <CalendarClock className="size-4" />
                        {offer.availability_summary}
                    </span>
                )}
            </div>
            <Button className="mt-5 w-fit" asChild>
                <Link href={offer.url}>
                    {t('offers.view_details')}
                    <ArrowRight className="transition group-hover:translate-x-1" />
                </Link>
            </Button>
        </article>
    );
}

export function PathCard({
    title,
    icon: Icon,
    steps,
}: {
    title: string;
    icon: ComponentType<{ className?: string }>;
    steps: string[];
}) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                    <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <ol className="mt-5 grid gap-3">
                {steps.map((step, index) => (
                    <li
                        key={step}
                        className="flex gap-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 dark:bg-slate-950"
                    >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-emerald-800 shadow-xs dark:bg-slate-900 dark:text-emerald-200">
                            {index + 1}
                        </span>
                        {step}
                    </li>
                ))}
            </ol>
        </article>
    );
}

export function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
}) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Icon className="mb-4 size-5 text-emerald-700 dark:text-emerald-300" />
            <p className="text-3xl font-semibold tracking-normal text-slate-950 dark:text-white">
                {value}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{label}</p>
        </article>
    );
}

export function EmptyState({
    title,
    icon: Icon = Compass,
    children,
}: {
    title: string;
    icon?: ComponentType<{ className?: string }>;
    children: ReactNode;
}) {
    return (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <Icon className="mx-auto mb-3 size-8 text-emerald-700 dark:text-emerald-300" />
            <h3 className="font-semibold text-slate-950 dark:text-white">
                {title}
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {children}
            </p>
        </div>
    );
}

export function CTASection({
    eyebrow,
    title,
    intro,
    primaryHref,
    primaryLabel,
    secondaryHref,
    secondaryLabel,
}: {
    eyebrow: string;
    title: string;
    intro: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref: string;
    secondaryLabel: string;
}) {
    return (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_58%,#78350f_100%)] p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-10 dark:border-slate-800">
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:42px_42px]" />
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-200">
                            {eyebrow}
                        </p>
                        <h2 className="max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
                            {title}
                        </h2>
                        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
                            {intro}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="secondary" asChild>
                            <Link href={primaryHref}>{primaryLabel}</Link>
                        </Button>
                        <Button
                            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                            variant="outline"
                            asChild
                        >
                            <Link href={secondaryHref}>{secondaryLabel}</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

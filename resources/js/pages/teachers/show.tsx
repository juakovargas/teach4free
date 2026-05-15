import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarClock,
    Clock,
    EllipsisVertical,
    Flag,
    Globe2,
    GraduationCap,
    HandHeart,
    Languages,
    MapPin,
    ShieldCheck,
    Star,
    Users,
} from 'lucide-react';
import type { FormEvent } from 'react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { EarnedBadgeCard } from '@/components/badges/badge-display';
import type { PublicBadge } from '@/components/badges/badge-display';
import InputError from '@/components/input-error';
import {
    EmptyState,
    LanguageBadge,
    OfferCard,
} from '@/components/public/public-identity';
import type {
    PublicLanguage,
    PublicOffer,
    PublicReputationSummary,
    PublicTeacher,
} from '@/components/public/public-identity';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
    public_intro: string | null;
    profile_accent_color: string | null;
    preferred_teaching_mode: string | null;
    max_students_per_session: number | null;
    default_session_duration_minutes: number | null;
    is_accepting_requests: boolean;
    availability: Availability[];
    badges: PublicBadge[];
    visibility: {
        show_badges: boolean;
        show_reviews: boolean;
        show_reputation_summary: boolean;
        show_completed_sessions_count: boolean;
        show_students_helped_count: boolean;
        show_teaching_hours: boolean;
        show_location: boolean;
        show_availability_summary: boolean;
    };
};

type ReviewSummary = {
    average: number | null;
    count: number;
    distribution: Record<string, number>;
};

type Review = {
    id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    teacher_response: string | null;
    teacher_responded_at: string | null;
    created_at: string | null;
    can_report: boolean;
    student: { name: string | null; avatar?: string | null };
    session: { title: string; starts_at: string | null } | null;
    offer: { title: string; slug: string } | null;
};

type Props = {
    teacher: Teacher;
    reputationSummary: PublicReputationSummary;
    reviewSummary: ReviewSummary;
    reviews: Review[];
    reviewReportTypes: string[];
    offers: PublicOffer[];
    openOffers: PublicOffer[];
};

export default function TeacherShow({ teacher, reputationSummary, reviewSummary, reviews, reviewReportTypes, offers, openOffers }: Props) {
    const { t } = useTranslation();
    const location = [teacher.city, teacher.country_code].filter(Boolean).join(', ');
    const accentColor = /^#[0-9a-fA-F]{6}$/.test(teacher.profile_accent_color ?? '')
        ? teacher.profile_accent_color
        : '#0f766e';
    const infoCards = [
        teacher.visibility.show_reviews
            ? {
                  icon: Star,
                  label: t('reviews.average_rating'),
                  value:
                      reviewSummary.count > 0
                          ? t('reviews.rating_summary_short', {
                                rating: reviewSummary.average ?? '-',
                                count: reviewSummary.count,
                            })
                          : t('reviews.no_reviews_short'),
              }
            : null,
        {
            icon: Languages,
            label: t('teachers.teaching_languages'),
            value: teacher.languages.map((language) => language.name).join(', '),
        },
        {
            icon: Users,
            label: t('teachers.preferred_mode'),
            value: teacher.preferred_teaching_mode
                ? t(`learning_modes.${teacher.preferred_teaching_mode}`)
                : t('common.not_applicable'),
        },
        {
            icon: Clock,
            label: t('teachers.default_duration'),
            value: teacher.default_session_duration_minutes
                ? t('offers.duration_value', {
                      minutes: teacher.default_session_duration_minutes,
                  })
                : t('common.not_applicable'),
        },
        {
            icon: CalendarClock,
            label: t('teachers.active_free_classes'),
            value: String(teacher.active_offers_count),
        },
    ].filter(Boolean) as {
        icon: ComponentType<{ className?: string }>;
        label: string;
        value: string;
    }[];

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
                                <div
                                    className="h-full w-full"
                                    style={{
                                        background: `radial-gradient(circle at 20% 20%, ${accentColor}55, transparent 18rem), radial-gradient(circle at 82% 10%, rgba(245,158,11,0.30), transparent 18rem), linear-gradient(135deg, #064e3b 0%, ${accentColor} 48%, #78350f 100%)`,
                                    }}
                                >
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
                                    {teacher.public_intro && (
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            {teacher.public_intro}
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
                        {infoCards.map((card) => (
                            <InfoCard key={card.label} icon={card.icon} label={card.label} value={card.value} />
                        ))}
                    </section>

                    {teacher.visibility.show_badges && (
                        <TeacherBadgesSection badges={teacher.badges} />
                    )}

                    {teacher.visibility.show_reputation_summary && (
                        <ReputationSummaryPanel summary={reputationSummary} visibility={teacher.visibility} />
                    )}

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
                            {teacher.visibility.show_availability_summary && (
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
                            )}
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

                    {teacher.visibility.show_reviews && (
                        <section className="space-y-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                        {t('reviews.public_eyebrow')}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold">
                                        {t('reviews.public_title')}
                                    </h2>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        {t('reviews.public_intro')}
                                    </p>
                                </div>
                                <RatingSummary summary={reviewSummary} />
                            </div>
                            {reviews.length === 0 ? (
                                <EmptyState title={t('reviews.no_reviews_title')}>
                                    {t('reviews.no_reviews_body')}
                                </EmptyState>
                            ) : (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {reviews.map((review) => (
                                        <ReviewCard key={review.id} review={review} reportTypes={reviewReportTypes} />
                                    ))}
                                </div>
                            )}
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

function TeacherBadgesSection({ badges }: { badges: PublicBadge[] }) {
    const { t } = useTranslation();
    const featured = badges.filter((badge) => badge.is_featured);
    const regular = badges.filter((badge) => !badge.is_featured);

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        {t('badges.public_eyebrow')}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                        {t('badges.public_title')}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {t('badges.public_intro')}
                    </p>
                </div>
                {featured.length > 0 && (
                    <Badge variant="outline" className="w-fit rounded-full">
                        {t('badges.featured_count', { count: featured.length })}
                    </Badge>
                )}
            </div>
            {badges.length === 0 ? (
                <div className="mt-5">
                    <EmptyState title={t('badges.public_empty_title')}>
                        {t('badges.public_empty_body')}
                    </EmptyState>
                </div>
            ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...featured, ...regular].map((badge) => (
                        <EarnedBadgeCard key={badge.id} badge={badge} />
                    ))}
                </div>
            )}
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
                {t('badges.public_help_body')}
            </p>
        </section>
    );
}

function ReputationSummaryPanel({
    summary,
    visibility,
}: {
    summary: PublicReputationSummary;
    visibility: Teacher['visibility'];
}) {
    const { t } = useTranslation();
    const metrics = [
        {
            icon: Star,
            label: t('reputation.average_rating'),
            value:
                summary.published_review_count > 0
                    ? t('reviews.rating_summary_short', {
                          rating: summary.average_rating ?? '-',
                          count: summary.published_review_count,
                      })
                    : t('reviews.no_reviews_short'),
            visible: visibility.show_reviews,
        },
        {
            icon: CalendarClock,
            label: t('reputation.completed_sessions'),
            value: String(summary.completed_sessions_count),
            visible: visibility.show_completed_sessions_count,
        },
        {
            icon: Users,
            label: t('reputation.students_helped'),
            value: String(summary.students_helped_count),
            visible: visibility.show_students_helped_count,
        },
        {
            icon: Clock,
            label: t('reputation.teaching_hours'),
            value: t('reputation.hours_value', {
                count: summary.teaching_hours,
            }),
            visible: visibility.show_teaching_hours,
        },
        {
            icon: ShieldCheck,
            label: t('reputation.cancellation_rate'),
            value: t('reputation.percentage_value', {
                value: summary.cancellation_rate,
            }),
            visible: true,
        },
        {
            icon: ShieldCheck,
            label: t('reputation.no_show_rate'),
            value: t('reputation.percentage_value', {
                value: summary.no_show_rate,
            }),
            visible: true,
        },
    ].filter((metric) => metric.visible !== false);

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        {t('reputation.public_eyebrow')}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">
                        {t('reputation.public_title')}
                    </h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {summary.has_enough_data
                            ? t('reputation.public_intro')
                            : t('reputation.new_teacher_public_body')}
                    </p>
                </div>
                <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-sm">
                    {t(`reputation.public_labels.${summary.reliability_label}`)}
                </Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.map((metric) => (
                    <div
                        key={metric.label}
                        className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                        <metric.icon className="mb-3 size-4 text-emerald-700 dark:text-emerald-300" />
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                            {metric.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{metric.value}</p>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
                {t('reputation.public_help_body')}
            </p>
        </section>
    );
}

function RatingSummary({ summary }: { summary: ReviewSummary }) {
    const { t } = useTranslation();

    return (
        <div className="min-w-64 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                    <Star className="size-5 fill-current" />
                </div>
                <div>
                    <p className="text-2xl font-semibold">{summary.average ?? '-'}</p>
                    <p className="text-xs text-muted-foreground">{t('reviews.review_count', { count: summary.count })}</p>
                </div>
            </div>
            <div className="mt-4 grid gap-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="grid grid-cols-[2.5rem_1fr_2rem] items-center gap-2 text-xs text-muted-foreground">
                        <span>{rating} <Star className="inline size-3 fill-current text-amber-500" /></span>
                        <span className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <span
                                className="block h-full rounded-full bg-amber-500"
                                style={{ width: `${summary.count > 0 ? ((summary.distribution[String(rating)] ?? 0) / summary.count) * 100 : 0}%` }}
                            />
                        </span>
                        <span className="text-right">{summary.distribution[String(rating)] ?? 0}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReviewCard({ review, reportTypes }: { review: Review; reportTypes: string[] }) {
    const { t } = useTranslation();
    const [reportOpen, setReportOpen] = useState(false);

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <ReportReviewDialog reviewId={review.id} open={reportOpen} reportTypes={reportTypes} onOpenChange={setReportOpen} />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`size-4 ${star <= review.rating ? 'fill-current' : ''}`} />
                        ))}
                    </div>
                    <h3 className="mt-2 font-semibold">{review.title ?? t('reviews.untitled_review')}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {review.student.name ?? t('common.not_applicable')} / {review.created_at ? new Date(review.created_at).toLocaleDateString() : '-'}
                    </p>
                </div>
                {review.can_report && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={t('reviews.review_actions')}>
                                <EllipsisVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.preventDefault();
                                    setReportOpen(true);
                                }}
                            >
                                <Flag />
                                {t('reviews.report_review')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            {review.comment && (
                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">{review.comment}</p>
            )}
            {review.offer && (
                <Link href={`/offers/${review.offer.slug}`} className="mt-3 inline-block text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                    {review.offer.title}
                </Link>
            )}
            {review.teacher_response && (
                <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 text-sm leading-6 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
                    <p className="font-semibold">{t('reviews.teacher_response')}</p>
                    <p className="mt-2 whitespace-pre-line">{review.teacher_response}</p>
                </div>
            )}
        </article>
    );
}

function ReportReviewDialog({
    reviewId,
    open,
    reportTypes,
    onOpenChange,
}: {
    reviewId: number;
    open: boolean;
    reportTypes: string[];
    onOpenChange: (open: boolean) => void;
}) {
    const { t } = useTranslation();
    const form = useForm({ type: 'abusive_language', description: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/reviews/${reviewId}/report`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('description');
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('reviews.report_review')}</DialogTitle>
                    <DialogDescription>{t('reviews.report_intro')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-muted-foreground dark:border-slate-800 dark:bg-slate-950">
                        {t('reviews.responsible_report_warning')}
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('reviews.report_type')}</Label>
                        <Select value={form.data.type} onValueChange={(value) => form.setData('type', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {reportTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{t(`review_report_types.${type}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.type} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="review-report-description">{t('reviews.report_description')}</Label>
                        <Textarea
                            id="review-report-description"
                            value={form.data.description}
                            onChange={(event) => form.setData('description', event.target.value)}
                            rows={4}
                        />
                        <InputError message={form.errors.description} />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">{t('actions.cancel')}</Button>
                        </DialogClose>
                        <Button disabled={form.processing}>
                            <Flag />
                            {t('reviews.submit_report')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
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

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarClock, Clock, MessageSquareReply, ShieldCheck, Star, Users } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import type { PublicReputationSummary } from '@/components/public/public-identity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Summary = {
    average_rating: number | null;
    published_reviews_count: number;
    pending_responses_count: number;
    hidden_reviews_count: number;
};

type Review = {
    id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    status: string;
    teacher_response: string | null;
    teacher_responded_at: string | null;
    reported_count: number;
    created_at: string | null;
    student: { name: string | null; avatar?: string | null };
    session: { title: string; starts_at: string | null; status: string } | null;
    offer: { title: string; slug: string } | null;
    can_respond: boolean;
};

type Props = {
    reputationSummary: PublicReputationSummary;
    summary: Summary;
    reviews: Review[];
};

export default function TeacherReviewsIndex({ reputationSummary, summary, reviews }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };

    return (
        <>
            <Head title={t('reviews.teacher_meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Star className="mt-1 size-6 fill-current text-amber-500" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('reviews.teacher_title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('reviews.teacher_intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-4">
                    <SummaryCard label={t('reviews.average_rating')} value={summary.average_rating ?? '-'} />
                    <SummaryCard label={t('reviews.published_reviews')} value={summary.published_reviews_count} />
                    <SummaryCard label={t('reviews.pending_responses')} value={summary.pending_responses_count} />
                    <SummaryCard label={t('reviews.hidden_reviews')} value={summary.hidden_reviews_count} />
                </section>

                <TeacherReputationSummary summary={reputationSummary} />

                <section className="grid gap-4">
                    {reviews.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {t('reviews.teacher_empty')}
                        </div>
                    )}
                    {reviews.map((review) => (
                        <TeacherReviewCard key={review.id} review={review} />
                    ))}
                </section>

                <ContextualHelp title={t('reviews.teacher_help_title')}>
                    {t('reviews.teacher_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
        </article>
    );
}

function TeacherReputationSummary({ summary }: { summary: PublicReputationSummary }) {
    const { t } = useTranslation();
    const metrics = [
        [t('reputation.completed_sessions'), summary.completed_sessions_count, CalendarClock],
        [t('reputation.students_helped'), summary.students_helped_count, Users],
        [t('reputation.teaching_hours'), t('reputation.hours_value', { count: summary.teaching_hours }), Clock],
        [t('reputation.cancellation_rate'), t('reputation.percentage_value', { value: summary.cancellation_rate }), ShieldCheck],
        [t('reputation.no_show_rate'), t('reputation.percentage_value', { value: summary.no_show_rate }), ShieldCheck],
    ] as const;

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">{t('reputation.teacher_title')}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {t('reputation.teacher_intro')}
                    </p>
                </div>
                <Badge variant="outline" className="w-fit rounded-full px-3 py-1 text-sm">
                    {t(`reputation.labels.${summary.reliability_label}`)}
                </Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {metrics.map(([label, value, Icon]) => (
                    <div
                        key={label}
                        className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                        <Icon className="mb-3 size-4 text-emerald-700 dark:text-emerald-300" />
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                            {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold">{value}</p>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
                {t('reputation.teacher_help_body')}
            </p>
        </section>
    );
}

function TeacherReviewCard({ review }: { review: Review }) {
    const { t } = useTranslation();
    const form = useForm({ teacher_response: review.teacher_response ?? '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/teacher/reviews/${review.id}/response`, { preserveScroll: true });
    };

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                        <Badge>{t(`teacher_review_statuses.${review.status}`)}</Badge>
                        {review.reported_count > 0 && <Badge variant="outline">{t('reviews.reported_count', { count: review.reported_count })}</Badge>}
                    </div>
                    <div className="mt-3 flex gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`size-4 ${star <= review.rating ? 'fill-current' : ''}`} />
                        ))}
                    </div>
                    <h2 className="mt-2 text-lg font-semibold">{review.title ?? t('reviews.untitled_review')}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {review.student.name ?? t('common.not_applicable')} / {review.created_at ? new Date(review.created_at).toLocaleString() : '-'}
                    </p>
                    {review.comment && <p className="mt-4 whitespace-pre-line text-sm leading-6 text-muted-foreground">{review.comment}</p>}
                    {review.offer && (
                        <Link href={`/offers/${review.offer.slug}`} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300">
                            {review.offer.title}
                        </Link>
                    )}
                </div>
                <div className="w-full shrink-0 lg:w-96">
                    <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                        <p className="text-sm font-semibold">{t('reviews.teacher_response')}</p>
                        {!review.can_respond && (
                            <p className="text-sm text-muted-foreground">{t('reviews.response_not_available')}</p>
                        )}
                        {review.can_respond && (
                            <>
                                <Textarea rows={5} value={form.data.teacher_response} onChange={(event) => form.setData('teacher_response', event.target.value)} />
                                <InputError message={form.errors.teacher_response} />
                                <Button disabled={form.processing}>
                                    <MessageSquareReply />
                                    {t('reviews.save_response')}
                                </Button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </article>
    );
}

TeacherReviewsIndex.layout = {
    breadcrumbs: [
        {
            title: 'navigation.teacher_reviews',
            href: '/teacher/reviews',
        },
    ],
};

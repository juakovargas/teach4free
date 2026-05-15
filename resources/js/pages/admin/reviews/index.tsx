import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Search, Star } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

type Review = {
    id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    status: string;
    reported_count: number;
    created_at: string | null;
    teacher: { id: number; name: string; email: string } | null;
    student: { id: number; name: string; email: string } | null;
    offer: { title: string; slug: string } | null;
    session_title: string | null;
};

type LinkItem = { url: string | null; label: string; active: boolean };

type Props = {
    reviews: { data: Review[]; links: LinkItem[] };
    filters: { status: string; rating: string; reported: string; low: boolean; search: string };
    statuses: string[];
    abuseSignals: {
        many_one_star: { student: string | null; count: number }[];
        hidden_reviews: { student: string | null; count: number }[];
        reported_reviews: { student: string | null; count: number }[];
    };
};

export default function AdminReviewsIndex({ reviews, filters, statuses, abuseSignals }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        status: filters.status,
        rating: filters.rating,
        reported: filters.reported,
        low: filters.low ? '1' : 'all',
        search: filters.search,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/reviews', form.data, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_reviews.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Star className="mt-1 size-6 fill-current text-amber-500" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_reviews.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_reviews.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{flash.status}</div>}

                <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_auto] dark:border-slate-800 dark:bg-slate-900">
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('actions.search')}</Label>
                        <Input id="search" value={form.data.search} onChange={(event) => form.setData('search', event.target.value)} placeholder={t('admin_reviews.search_placeholder')} />
                    </div>
                    <FilterSelect label={t('admin_reviews.status')} value={form.data.status} onChange={(value) => form.setData('status', value)} allLabel={t('filters.all_statuses')} values={statuses} prefix="teacher_review_statuses" />
                    <FilterSelect label={t('admin_reviews.rating')} value={form.data.rating} onChange={(value) => form.setData('rating', value)} allLabel={t('filters.all_ratings')} values={['5', '4', '3', '2', '1']} />
                    <FilterSelect label={t('admin_reviews.reported')} value={form.data.reported} onChange={(value) => form.setData('reported', value)} allLabel={t('filters.all_reports')} values={['reported', 'unreported']} prefix="admin_reviews.report_filters" />
                    <FilterSelect label={t('admin_reviews.low_ratings')} value={form.data.low} onChange={(value) => form.setData('low', value)} allLabel={t('common.no')} values={['1']} prefix="admin_reviews.low_filter" />
                    <div className="flex items-end">
                        <Button><Search />{t('actions.search')}</Button>
                    </div>
                </form>

                <section className="grid gap-3">
                    {reviews.data.length === 0 && <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">{t('admin_reviews.empty')}</div>}
                    {reviews.data.map((review) => (
                        <article key={review.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        <Badge>{t(`teacher_review_statuses.${review.status}`)}</Badge>
                                        <Badge variant="outline">{review.rating}/5</Badge>
                                        {review.reported_count > 0 && <Badge variant="outline">{t('reviews.reported_count', { count: review.reported_count })}</Badge>}
                                    </div>
                                    <h2 className="mt-2 font-semibold">{review.title ?? t('reviews.untitled_review')}</h2>
                                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{review.comment ?? t('common.none')}</p>
                                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                        <p><span className="font-medium text-foreground">{t('admin_reviews.teacher')}:</span> {review.teacher?.name ?? review.teacher?.email ?? '-'}</p>
                                        <p><span className="font-medium text-foreground">{t('admin_reviews.student')}:</span> {review.student?.name ?? review.student?.email ?? '-'}</p>
                                        <p><span className="font-medium text-foreground">{t('admin_reviews.session')}:</span> {review.session_title ?? '-'}</p>
                                        <p><span className="font-medium text-foreground">{t('admin_reviews.created_at')}:</span> {review.created_at ? new Date(review.created_at).toLocaleString() : '-'}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/reviews/${review.id}`}>{t('actions.view')}</Link>
                                </Button>
                            </div>
                        </article>
                    ))}
                </section>

                <Pagination links={reviews.links} />
                <AbuseSignals signals={abuseSignals} />

                <ContextualHelp title={t('admin_reviews.help_title')}>
                    {t('admin_reviews.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    allLabel,
    values,
    prefix,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    allLabel: string;
    values: string[];
    prefix?: string;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{allLabel}</SelectItem>
                    {values.map((item) => (
                        <SelectItem key={item} value={item}>{prefix ? t(`${prefix}.${item}`) : item}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function Pagination({ links }: { links: LinkItem[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link, index) => (
                <Button key={`${link.label}-${index}`} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url} asChild={Boolean(link.url)}>
                    {link.url ? <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span dangerouslySetInnerHTML={{ __html: link.label }} />}
                </Button>
            ))}
        </div>
    );
}

function AbuseSignals({ signals }: { signals: Props['abuseSignals'] }) {
    const { t } = useTranslation();
    const sections = [
        ['many_one_star', signals.many_one_star],
        ['hidden_reviews', signals.hidden_reviews],
        ['reported_reviews', signals.reported_reviews],
    ] as const;

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">{t('admin_reviews.abuse_signals')}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
                {sections.map(([key, rows]) => (
                    <div key={key} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                        <p className="font-medium">{t(`admin_reviews.abuse_signal_${key}`)}</p>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                            {rows.length === 0 && <p>{t('admin_reviews.no_abuse_signals')}</p>}
                            {rows.map((row) => (
                                <p key={`${key}-${row.student}`}>{row.student ?? '-'}: {row.count}</p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

AdminReviewsIndex.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.reviews_moderation',
            href: '/admin/reviews',
        },
    ],
};

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Save, Star } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
    session: { id: number; title: string; status: string; starts_at: string | null; ends_at: string | null; timezone: string } | null;
    teacher_response: string | null;
    teacher_responded_at: string | null;
    admin_notes: string | null;
    hidden_reason: string | null;
    hidden_at: string | null;
    hidden_by: { name: string; email: string } | null;
    reports: { id: number; type: string; status: string; priority: string; description: string | null; created_at: string | null; reporter: { name: string; email: string } | null }[];
};

type Props = {
    review: Review;
    statuses: string[];
};

export default function AdminReviewShow({ review, statuses }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        status: review.status,
        hidden_reason: review.hidden_reason ?? '',
        admin_notes: review.admin_notes ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/reviews/${review.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_reviews.detail_title', { id: review.id })} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Star className="mt-1 size-6 fill-current text-amber-500" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_reviews.detail_title', { id: review.id })}</h1>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{t(`teacher_review_statuses.${review.status}`)}</Badge>
                                <Badge variant="outline">{review.rating}/5</Badge>
                                {review.reported_count > 0 && <Badge variant="outline">{t('reviews.reported_count', { count: review.reported_count })}</Badge>}
                            </div>
                        </div>
                    </div>
                </section>

                {flash.status && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{flash.status}</div>}

                <section className="grid gap-6 lg:grid-cols-[1fr_22rem]">
                    <div className="space-y-4">
                        <Panel title={t('admin_reviews.review_content')}>
                            <div className="flex gap-1 text-amber-500">
                                {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-4 ${star <= review.rating ? 'fill-current' : ''}`} />)}
                            </div>
                            <h2 className="mt-3 text-lg font-semibold">{review.title ?? t('reviews.untitled_review')}</h2>
                            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{review.comment ?? t('common.none')}</p>
                            {review.teacher_response && (
                                <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/70 p-4 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/20">
                                    <p className="font-semibold">{t('reviews.teacher_response')}</p>
                                    <p className="mt-2 whitespace-pre-line text-muted-foreground">{review.teacher_response}</p>
                                </div>
                            )}
                        </Panel>
                        <Panel title={t('admin_reviews.context')}>
                            <dl className="grid gap-3 text-sm md:grid-cols-2">
                                <Info label={t('admin_reviews.teacher')} value={review.teacher ? `${review.teacher.name} (${review.teacher.email})` : '-'} />
                                <Info label={t('admin_reviews.student')} value={review.student ? `${review.student.name} (${review.student.email})` : '-'} />
                                <Info label={t('admin_reviews.session')} value={review.session?.title ?? '-'} />
                                <Info label={t('admin_reviews.created_at')} value={review.created_at ? new Date(review.created_at).toLocaleString() : '-'} />
                            </dl>
                            {review.offer && (
                                <Link href={`/offers/${review.offer.slug}`} className="mt-4 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-300">
                                    {review.offer.title}
                                </Link>
                            )}
                        </Panel>
                        <Panel title={t('admin_reviews.linked_reports')}>
                            {review.reports.length === 0 && <p className="text-sm text-muted-foreground">{t('admin_reviews.no_reports')}</p>}
                            <div className="grid gap-3">
                                {review.reports.map((report) => (
                                    <Link key={report.id} href={`/admin/review-reports/${report.id}`} className="rounded-md border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge>{t(`review_report_types.${report.type}`)}</Badge>
                                            <Badge variant="outline">{t(`review_report_statuses.${report.status}`)}</Badge>
                                            <Badge variant={report.priority === 'urgent' || report.priority === 'high' ? 'destructive' : 'outline'}>{t(`priorities.${report.priority}`)}</Badge>
                                        </div>
                                        <p className="mt-2 text-muted-foreground">{report.description ?? t('common.none')}</p>
                                    </Link>
                                ))}
                            </div>
                        </Panel>
                    </div>

                    <aside>
                        <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('admin_reviews.admin_actions')}</h2>
                            <div className="mt-4 grid gap-3">
                                <Field label={t('admin_reviews.status')}>
                                    <Select value={form.data.status} onValueChange={(value) => form.setData('status', value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((status) => <SelectItem key={status} value={status}>{t(`teacher_review_statuses.${status}`)}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label={t('admin_reviews.hidden_reason')} description={t('admin_reviews.hidden_reason_help')}>
                                    <Textarea value={form.data.hidden_reason} onChange={(event) => form.setData('hidden_reason', event.target.value)} rows={4} />
                                    <InputError message={form.errors.hidden_reason} />
                                </Field>
                                <Field label={t('admin_reviews.admin_notes')} description={t('admin_reviews.admin_notes_help')}>
                                    <Textarea value={form.data.admin_notes} onChange={(event) => form.setData('admin_notes', event.target.value)} rows={5} />
                                </Field>
                                <Button disabled={form.processing}>
                                    <Save />
                                    {t('actions.save')}
                                </Button>
                            </div>
                        </form>
                    </aside>
                </section>

                <ContextualHelp title={t('admin_reviews.detail_help_title')}>
                    {t('admin_reviews.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">{title}</h2>
            <div className="mt-4">{children}</div>
        </section>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-medium">{value}</dd>
        </div>
    );
}

function Field({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {description && <p className="text-xs leading-5 text-muted-foreground">{description}</p>}
            {children}
        </div>
    );
}

AdminReviewShow.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.reviews_moderation',
            href: '/admin/reviews',
        },
    ],
};

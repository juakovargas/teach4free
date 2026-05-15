import { Head, Link, router } from '@inertiajs/react';
import { Filter, ShieldCheck, Star } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import type { PublicReputationSummary } from '@/components/public/public-identity';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

type TeacherRow = {
    teacher: {
        id: number;
        name: string;
        email: string;
        avatar: string | null;
        initials: string;
        headline: string | null;
        city: string | null;
        country_code: string | null;
        is_active: boolean;
        is_verified: boolean;
        public_profile_url: string | null;
        admin_user_url: string;
    };
    reputation: PublicReputationSummary;
    reported_reviews_count: number;
    hidden_reviews_count: number;
    incidents_count: number;
    last_session_at: string | null;
    admin_reviews_url: string;
    admin_sessions_url: string;
};

type Filters = {
    search: string;
    reliability_label: string;
    min_completed_sessions: number;
    low_rating: boolean;
    high_cancellation_rate: boolean;
    high_no_show_rate: boolean;
    new_teachers: boolean;
};

type Props = {
    teachers: TeacherRow[];
    filters: Filters;
    summary: {
        total: number;
        filtered: number;
        new_teacher: number;
        excellent: number;
        reliable: number;
        needs_attention: number;
    };
    labels: PublicReputationSummary['reliability_label'][];
};

export default function AdminReputationIndex({ teachers, filters, summary, labels }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState<Filters>(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/reputation', form, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title={t('admin_reputation.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <ShieldCheck className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {t('admin_reputation.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin_reputation.intro')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    <Stat label={t('admin_reputation.total')} value={summary.total} />
                    <Stat label={t('admin_reputation.filtered')} value={summary.filtered} />
                    <Stat label={t('reputation.labels.excellent')} value={summary.excellent} />
                    <Stat label={t('reputation.labels.reliable')} value={summary.reliable} />
                    <Stat label={t('reputation.labels.new_teacher')} value={summary.new_teacher} />
                    <Stat label={t('reputation.labels.needs_attention')} value={summary.needs_attention} />
                </section>

                <form
                    onSubmit={submit}
                    className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs lg:grid-cols-[1.4fr_1fr_1fr_1fr] dark:border-slate-800 dark:bg-slate-900"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('admin_reputation.search')}</Label>
                        <Input
                            id="search"
                            value={form.search}
                            onChange={(event) => setForm({ ...form, search: event.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>{t('admin_reputation.reliability_label')}</Label>
                        <Select
                            value={form.reliability_label || 'all'}
                            onValueChange={(value) => setForm({ ...form, reliability_label: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('filters.all_statuses')}</SelectItem>
                                {labels.map((label) => (
                                    <SelectItem key={label} value={label}>
                                        {t(`reputation.labels.${label}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="min_completed_sessions">
                            {t('admin_reputation.min_completed_sessions')}
                        </Label>
                        <Input
                            id="min_completed_sessions"
                            min={0}
                            type="number"
                            value={form.min_completed_sessions}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    min_completed_sessions: Number(event.target.value),
                                })
                            }
                        />
                    </div>
                    <div className="flex items-end">
                        <Button className="w-full">
                            <Filter />
                            {t('actions.filter')}
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-4 lg:col-span-4">
                        <BooleanFilter
                            checked={form.low_rating}
                            label={t('admin_reputation.low_rating')}
                            onCheckedChange={(checked) => setForm({ ...form, low_rating: checked })}
                        />
                        <BooleanFilter
                            checked={form.high_cancellation_rate}
                            label={t('admin_reputation.high_cancellation_rate')}
                            onCheckedChange={(checked) => setForm({ ...form, high_cancellation_rate: checked })}
                        />
                        <BooleanFilter
                            checked={form.high_no_show_rate}
                            label={t('admin_reputation.high_no_show_rate')}
                            onCheckedChange={(checked) => setForm({ ...form, high_no_show_rate: checked })}
                        />
                        <BooleanFilter
                            checked={form.new_teachers}
                            label={t('admin_reputation.new_teachers')}
                            onCheckedChange={(checked) => setForm({ ...form, new_teachers: checked })}
                        />
                    </div>
                </form>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_reputation.teacher')}</th>
                                    <th className="px-4 py-3">{t('reputation.average_rating')}</th>
                                    <th className="px-4 py-3">{t('reputation.completed_sessions')}</th>
                                    <th className="px-4 py-3">{t('reputation.students_helped')}</th>
                                    <th className="px-4 py-3">{t('reputation.teaching_hours')}</th>
                                    <th className="px-4 py-3">{t('reputation.cancellation_rate')}</th>
                                    <th className="px-4 py-3">{t('reputation.no_show_rate')}</th>
                                    <th className="px-4 py-3">{t('admin_reputation.label')}</th>
                                    <th className="px-4 py-3">{t('admin_reputation.moderation_signals')}</th>
                                    <th className="px-4 py-3">{t('admin_reputation.last_session')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_reputation.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                                            {t('admin_reputation.empty')}
                                        </td>
                                    </tr>
                                )}
                                {teachers.map((row) => (
                                    <TeacherTableRow key={row.teacher.id} row={row} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ContextualHelp title={t('admin_reputation.help_title')}>
                    {t('admin_reputation.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function TeacherTableRow({ row }: { row: TeacherRow }) {
    const { t } = useTranslation();
    const location = [row.teacher.city, row.teacher.country_code].filter(Boolean).join(', ');

    return (
        <tr className="border-b last:border-0">
            <td className="px-4 py-4">
                <div className="flex min-w-60 items-center gap-3">
                    {row.teacher.avatar ? (
                        <img src={row.teacher.avatar} alt="" className="size-10 rounded-full object-cover" />
                    ) : (
                        <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                            {row.teacher.initials}
                        </span>
                    )}
                    <div>
                        <p className="font-medium">{row.teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{row.teacher.email}</p>
                        {location && <p className="text-xs text-muted-foreground">{location}</p>}
                    </div>
                </div>
            </td>
            <td className="px-4 py-4">
                <div className="flex items-center gap-1">
                    <Star className="size-3 fill-current text-amber-500" />
                    {row.reputation.average_rating ?? '-'} ({row.reputation.published_review_count})
                </div>
            </td>
            <td className="px-4 py-4">{row.reputation.completed_sessions_count}</td>
            <td className="px-4 py-4">{row.reputation.students_helped_count}</td>
            <td className="px-4 py-4">{row.reputation.teaching_hours}</td>
            <td className="px-4 py-4">{t('reputation.percentage_value', { value: row.reputation.cancellation_rate })}</td>
            <td className="px-4 py-4">{t('reputation.percentage_value', { value: row.reputation.no_show_rate })}</td>
            <td className="px-4 py-4">
                <Badge variant="outline" className="rounded-full">
                    {t(`reputation.labels.${row.reputation.reliability_label}`)}
                </Badge>
            </td>
            <td className="px-4 py-4 text-muted-foreground">
                {t('admin_reputation.signal_counts', {
                    reported: row.reported_reviews_count,
                    hidden: row.hidden_reviews_count,
                    incidents: row.incidents_count,
                })}
            </td>
            <td className="px-4 py-4 text-muted-foreground">
                {row.last_session_at ? new Date(row.last_session_at).toLocaleDateString() : '-'}
            </td>
            <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                    {row.teacher.public_profile_url && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={row.teacher.public_profile_url}>{t('admin_reputation.public_profile')}</Link>
                        </Button>
                    )}
                    <Button variant="outline" size="sm" asChild>
                        <Link href={row.teacher.admin_user_url}>{t('admin_reputation.user')}</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={row.admin_reviews_url}>{t('admin_reputation.reviews')}</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={row.admin_sessions_url}>{t('admin_reputation.sessions')}</Link>
                    </Button>
                </div>
            </td>
        </tr>
    );
}

function BooleanFilter({
    checked,
    label,
    onCheckedChange,
}: {
    checked: boolean;
    label: string;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
            {label}
        </label>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
        </article>
    );
}

AdminReputationIndex.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.reputation',
            href: '/admin/reputation',
        },
    ],
};

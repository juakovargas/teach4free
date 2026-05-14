import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Clock, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type CountRow = {
    count?: number;
    blocks_count?: number;
    sessions_count?: number;
    applications_count?: number;
};

type Availability = {
    by_weekday: Array<{ day_of_week: number; blocks_count: number }>;
    by_timezone: Array<{ timezone: string; blocks_count: number }>;
    top_teachers: Array<{ user_id: number; blocks_count: number; user?: { id: number; name: string; email: string } | null }>;
    teachers_without_availability: Array<{ user?: { id: number; name: string; email: string } | null }>;
};

type Sessions = {
    status_counts: Array<{ status: string; count: number }>;
    upcoming_by_day: Array<{ date: string; sessions_count: number }>;
    active_categories: Array<{ name: string; color?: string | null; sessions_count: number }>;
    active_subjects: Array<{ name: string; sessions_count: number }>;
};

type Demand = {
    requested_weekdays: Array<{ day_of_week: number; applications_count: number }>;
    subjects_by_applications: Array<{ name: string; applications_count: number }>;
    waitlisted_offers: Array<{ id: number; slug: string; title: string; waitlisted_count: number; user?: { name: string; email: string } | null }>;
    average_pending_per_offer: number;
};

type Props = {
    availability: Availability;
    sessions: Sessions;
    demand: Demand;
    summary: {
        availability_blocks: number;
        sessions: number;
        upcoming_sessions: number;
        applications: number;
        pending_applications: number;
    };
};

export default function AdminCalendarOverview({ availability, sessions, demand, summary }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('admin_calendar_overview.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <CalendarDays className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_calendar_overview.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_calendar_overview.intro')}</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <Stat label={t('admin_calendar_overview.availability_blocks')} value={summary.availability_blocks} />
                    <Stat label={t('admin_calendar_overview.sessions')} value={summary.sessions} />
                    <Stat label={t('admin_calendar_overview.upcoming_sessions')} value={summary.upcoming_sessions} />
                    <Stat label={t('admin_calendar_overview.applications')} value={summary.applications} />
                    <Stat label={t('admin_calendar_overview.pending_applications')} value={summary.pending_applications} />
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                    <Panel icon={Clock} title={t('admin_calendar_overview.availability_title')} intro={t('admin_calendar_overview.availability_intro')}>
                        <List title={t('admin_calendar_overview.weekdays')} rows={availability.by_weekday} empty={t('admin_calendar_overview.empty_availability')} render={(row) => `${t(`weekdays.${row.day_of_week}`)} - ${count(row, 'blocks_count')}`} />
                        <List title={t('admin_calendar_overview.timezones')} rows={availability.by_timezone} empty={t('admin_calendar_overview.empty_availability')} render={(row) => `${row.timezone} - ${count(row, 'blocks_count')}`} />
                        <List title={t('admin_calendar_overview.top_teachers')} rows={availability.top_teachers} empty={t('admin_calendar_overview.empty_availability')} render={(row) => `${row.user?.name ?? t('common.none')} - ${count(row, 'blocks_count')}`} />
                        <List title={t('admin_calendar_overview.teachers_without_availability')} rows={availability.teachers_without_availability} empty={t('admin_calendar_overview.empty_teachers_without_availability')} render={(row) => row.user?.name ?? t('common.none')} />
                    </Panel>

                    <Panel icon={CalendarDays} title={t('admin_calendar_overview.sessions_title')} intro={t('admin_calendar_overview.sessions_intro')}>
                        <div className="flex flex-wrap gap-2">
                            {sessions.status_counts.map((item) => (
                                <Badge key={item.status} variant="outline">{t(`session_statuses.${item.status}`)}: {item.count}</Badge>
                            ))}
                        </div>
                        <List title={t('admin_calendar_overview.upcoming_by_day')} rows={sessions.upcoming_by_day} empty={t('admin_calendar_overview.empty_sessions')} render={(row) => `${new Date(row.date).toLocaleDateString()} - ${count(row, 'sessions_count')}`} />
                        <List title={t('admin_calendar_overview.active_categories')} rows={sessions.active_categories} empty={t('admin_calendar_overview.empty_sessions')} render={(row) => `${row.name} - ${count(row, 'sessions_count')}`} />
                        <List title={t('admin_calendar_overview.active_subjects')} rows={sessions.active_subjects} empty={t('admin_calendar_overview.empty_sessions')} render={(row) => `${row.name} - ${count(row, 'sessions_count')}`} />
                    </Panel>

                    <Panel icon={ClipboardList} title={t('admin_calendar_overview.demand_title')} intro={t('admin_calendar_overview.demand_intro')}>
                        <List title={t('admin_calendar_overview.requested_weekdays')} rows={demand.requested_weekdays} empty={t('admin_calendar_overview.empty_demand')} render={(row) => `${t(`weekdays.${row.day_of_week}`)} - ${count(row, 'applications_count')}`} />
                        <List title={t('admin_calendar_overview.subjects_by_applications')} rows={demand.subjects_by_applications} empty={t('admin_calendar_overview.empty_demand')} render={(row) => `${row.name} - ${count(row, 'applications_count')}`} />
                        <div className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                            <p className="text-xs text-muted-foreground">{t('admin_calendar_overview.average_pending_per_offer')}</p>
                            <p className="mt-1 text-xl font-semibold">{demand.average_pending_per_offer}</p>
                        </div>
                        <div className="grid gap-2">
                            <h3 className="text-sm font-semibold">{t('admin_calendar_overview.waitlisted_offers')}</h3>
                            {demand.waitlisted_offers.length === 0 && <p className="text-sm text-muted-foreground">{t('admin_calendar_overview.empty_demand')}</p>}
                            {demand.waitlisted_offers.map((offer) => (
                                <div key={offer.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                                    <div>
                                        <p className="font-medium">{offer.title}</p>
                                        <p className="text-xs text-muted-foreground">{offer.user?.name ?? t('common.none')}</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/teaching-offers/${offer.slug}`}>{offer.waitlisted_count}</Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </section>

                <ContextualHelp title={t('admin_calendar_overview.help_title')}>
                    {t('admin_calendar_overview.help_body')}
                </ContextualHelp>
            </div>
        </>
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

function Panel({
    title,
    intro,
    icon: Icon,
    children,
}: {
    title: string;
    intro: string;
    icon: LucideIcon;
    children: ReactNode;
}) {
    return (
        <article className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 text-emerald-700 dark:text-emerald-300" />
                <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{intro}</p>
                </div>
            </div>
            {children}
        </article>
    );
}

function List<T>({
    title,
    rows,
    empty,
    render,
}: {
    title: string;
    rows: T[];
    empty: string;
    render: (row: T) => string;
}) {
    return (
        <div className="grid gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            {rows.length === 0 && <p className="text-sm text-muted-foreground">{empty}</p>}
            {rows.map((row, index) => (
                <p key={index} className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                    {render(row)}
                </p>
            ))}
        </div>
    );
}

function count(row: CountRow, key: keyof CountRow): number {
    return Number(row[key] ?? 0);
}

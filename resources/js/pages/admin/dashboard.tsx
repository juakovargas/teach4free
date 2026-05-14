import { Head, Link } from '@inertiajs/react';
import {
    Ban,
    Bell,
    CalendarClock,
    FileText,
    Flag,
    Globe2,
    GraduationCap,
    Languages,
    Map,
    MessageSquareWarning,
    Presentation,
    ShieldAlert,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Stats = {
    total_users: number;
    active_students: number;
    active_teachers: number;
    mixed_users: number;
    published_teaching_offers: number;
    open_public_sessions: number;
    pending_applications: number;
    waitlisted_applications: number;
    open_incidents: number;
    incidents_pending_review: number;
    open_conversation_reports: number;
    pending_moderation: number;
    reports_awaiting_response: number;
    banned_users: number;
    blocked_users: number;
    active_languages: number;
    categories: number;
    subjects: number;
    internal_notifications_sent: number;
    google_users: number;
    suspended_offers: number;
    scheduled_sessions: number;
    completed_sessions: number;
    cancelled_sessions: number;
    no_show_sessions: number;
    upcoming_sessions_this_week: number;
    reports: number;
    reviews: number;
};

type Growth = {
    new_users: number;
    new_teachers: number;
    new_offers: number;
    new_applications: number;
};

type WorldSummary = {
    countries_represented: number;
    located_users: number;
    top_countries: { country_code: string; users_count: number }[];
};

type UserSummary = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    role?: string;
    created_at?: string | null;
};

type OfferSummary = {
    id: number;
    title: string;
    slug: string;
    is_active: boolean;
    published_at: string | null;
    user?: UserSummary;
    created_at?: string | null;
};

type ApplicationSummary = {
    id: number;
    status: string;
    requested_at?: string | null;
    created_at?: string | null;
    student?: UserSummary;
    offer?: { title: string; slug: string };
};

type IncidentSummary = {
    id: number;
    type: string;
    status: string;
    priority: string;
    subject: string;
    created_at?: string | null;
    reporter?: UserSummary | null;
};

type Props = {
    stats: Stats;
    growth: Growth;
    activity: {
        latest_users: UserSummary[];
        latest_offers: OfferSummary[];
        latest_applications: ApplicationSummary[];
        latest_incidents: IncidentSummary[];
    };
    world: WorldSummary;
};

export default function AdminDashboard({ stats, growth, activity, world }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();

    const platformHealth = [
        { label: t('admin.total_users'), value: stats.total_users, icon: Users, href: '/admin/users' },
        { label: t('admin.active_students'), value: stats.active_students, icon: GraduationCap, href: '/admin/students' },
        { label: t('admin.active_teachers'), value: stats.active_teachers, icon: Presentation, href: '/admin/teachers' },
        { label: t('admin.mixed_users'), value: stats.mixed_users, icon: Users, href: '/admin/users?profile=both' },
        { label: t('admin.published_teaching_offers'), value: stats.published_teaching_offers, icon: Flag, href: '/admin/teaching-offers' },
        { label: t('admin.pending_applications'), value: stats.pending_applications, icon: UserCheck, href: '/admin/applications' },
    ];

    const moderation = [
        { label: t('admin.pending_moderation'), value: stats.pending_moderation, icon: ShieldAlert, href: '/admin/incidents?status=open' },
        { label: t('admin.open_incidents'), value: stats.open_incidents, icon: ShieldAlert, href: '/admin/incidents?status=open' },
        { label: t('admin.open_reports'), value: stats.open_conversation_reports, icon: MessageSquareWarning, href: '/admin/conversation-reports?status=open' },
        { label: t('admin.reports'), value: stats.reports, icon: MessageSquareWarning, href: '/admin/reports' },
        { label: t('admin.incidents_pending_review'), value: stats.incidents_pending_review, icon: ShieldAlert, href: '/admin/incidents' },
        { label: t('admin.reports_awaiting_response'), value: stats.reports_awaiting_response, icon: MessageSquareWarning, href: '/admin/incidents' },
        { label: t('admin.banned_users'), value: stats.banned_users, icon: Ban, href: '/admin/users?status=banned' },
        { label: t('admin.blocked_users'), value: stats.blocked_users, icon: Ban, href: '/admin/users?status=blocked' },
        { label: t('admin.suspended_offers'), value: stats.suspended_offers, icon: FileText, href: '/admin/teaching-offers' },
    ];

    const operations = [
        { label: t('admin.open_public_sessions'), value: stats.open_public_sessions, icon: Globe2, href: '/admin/open-sessions' },
        { label: t('admin.waitlisted_applications'), value: stats.waitlisted_applications, icon: UserCheck, href: '/admin/applications' },
        { label: t('admin.active_languages'), value: stats.active_languages, icon: Languages, href: '/admin/languages' },
        { label: t('admin.categories'), value: stats.categories, icon: FileText, href: '/admin/categories' },
        { label: t('admin.subjects'), value: stats.subjects, icon: FileText, href: '/admin/subjects' },
        { label: t('admin.google_users'), value: stats.google_users, icon: Users, href: '/admin/users?profile=google' },
        { label: t('admin.scheduled_sessions'), value: stats.scheduled_sessions, icon: CalendarClock, href: '/admin/sessions?status=scheduled' },
        { label: t('admin.upcoming_sessions_this_week'), value: stats.upcoming_sessions_this_week, icon: CalendarClock, href: '/admin/sessions?status=scheduled' },
        { label: t('admin.internal_notifications_sent'), value: stats.internal_notifications_sent, icon: Bell, href: '/admin/notifications' },
    ];

    const sessionCards = [
        { label: t('admin.scheduled_sessions'), value: stats.scheduled_sessions, icon: CalendarClock, href: '/admin/sessions?status=scheduled' },
        { label: t('admin.completed_sessions'), value: stats.completed_sessions, icon: CalendarClock, href: '/admin/sessions?status=completed' },
        { label: t('admin.cancelled_sessions'), value: stats.cancelled_sessions, icon: CalendarClock, href: '/admin/sessions?status=cancelled' },
        { label: t('admin.no_show_sessions'), value: stats.no_show_sessions, icon: CalendarClock, href: '/admin/sessions?status=no_show' },
        { label: t('admin.upcoming_sessions_this_week'), value: stats.upcoming_sessions_this_week, icon: CalendarClock, href: '/admin/sessions?status=scheduled' },
    ];

    const growthCards = [
        { label: t('admin.new_users_7d'), value: growth.new_users },
        { label: t('admin.new_teachers_7d'), value: growth.new_teachers },
        { label: t('admin.new_offers_7d'), value: growth.new_offers },
        { label: t('admin.new_applications_7d'), value: growth.new_applications },
    ];

    return (
        <>
            <Head title={t('admin.meta_title')} />
            <div className="space-y-8 p-4 sm:p-6">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="mt-1 size-7 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin.intro')}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/world-map">
                                <Map />
                                {t('admin.open_world_map')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/users">
                                <Users />
                                {t('admin.open_users')}
                            </Link>
                        </Button>
                    </div>
                </section>

                <DashboardSection title={t('admin.platform_health')} items={platformHealth} />
                <DashboardSection title={t('admin.moderation')} items={moderation} />
                <DashboardSection title={t('admin.operations')} items={operations} />
                <DashboardSection title={t('admin.sessions')} items={sessionCards} />

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Map className="size-5 text-emerald-700 dark:text-emerald-300" />
                            <h2 className="text-lg font-semibold">{t('admin.world_distribution_summary')}</h2>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/admin/world-map">
                                <Map />
                                {t('admin.open_world_map')}
                            </Link>
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <article className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                            <p className="text-sm text-muted-foreground">{t('admin.countries_represented')}</p>
                            <p className="mt-3 text-3xl font-semibold">{world.countries_represented}</p>
                        </article>
                        <article className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                            <p className="text-sm text-muted-foreground">{t('admin.located_users')}</p>
                            <p className="mt-3 text-3xl font-semibold">{world.located_users}</p>
                        </article>
                        <article className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                            <p className="text-sm font-medium text-muted-foreground">{t('admin.top_countries')}</p>
                            <div className="mt-3 grid gap-2">
                                {world.top_countries.length === 0 && <p className="text-sm text-muted-foreground">{t('admin_world_map.empty')}</p>}
                                {world.top_countries.map((country) => (
                                    <div key={country.country_code} className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-medium">{country.country_code}</span>
                                        <span className="text-muted-foreground">{country.users_count}</span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center gap-2">
                        <TrendingUp className="size-5 text-emerald-700 dark:text-emerald-300" />
                        <h2 className="text-lg font-semibold">{t('admin.growth')}</h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {growthCards.map((card) => (
                            <article key={card.label} className="rounded-md border border-slate-200 p-4 dark:border-slate-800">
                                <p className="text-sm text-muted-foreground">{card.label}</p>
                                <p className="mt-3 text-3xl font-semibold">{card.value}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <ActivityPanel title={t('admin.latest_users')}>
                        {activity.latest_users.map((user) => (
                            <Link key={user.id} href={`/admin/users/${user.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-950">
                                <Avatar className="size-9">
                                    <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                                    <AvatarFallback>{getInitials(user.name || user.email)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate font-medium">{user.name || user.email}</p>
                                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <Badge className="ml-auto" variant={user.role === 'admin' ? 'default' : 'outline'}>
                                    {t(`admin_user_roles.${user.role ?? 'user'}`)}
                                </Badge>
                            </Link>
                        ))}
                    </ActivityPanel>

                    <ActivityPanel title={t('admin.latest_offers')}>
                        {activity.latest_offers.map((offer) => (
                            <Link key={offer.id} href={`/admin/teaching-offers/${offer.slug}`} className="block rounded-md px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-950">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate font-medium">{offer.title}</p>
                                    <Badge variant={offer.is_active ? 'default' : 'outline'}>
                                        {t(offer.is_active ? 'statuses.active' : 'statuses.inactive')}
                                    </Badge>
                                </div>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {offer.user?.name ?? offer.user?.email ?? t('common.none')}
                                </p>
                            </Link>
                        ))}
                    </ActivityPanel>

                    <ActivityPanel title={t('admin.latest_applications')}>
                        {activity.latest_applications.map((application) => (
                            <div key={application.id} className="rounded-md px-2 py-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate font-medium">{application.offer?.title ?? t('common.none')}</p>
                                    <Badge>{t(`application_statuses.${application.status}`)}</Badge>
                                </div>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {application.student?.name ?? application.student?.email ?? t('common.none')}
                                </p>
                            </div>
                        ))}
                    </ActivityPanel>

                    <ActivityPanel title={t('admin.latest_incidents')}>
                        {activity.latest_incidents.map((incident) => (
                            <Link key={incident.id} href={`/admin/incidents/${incident.id}`} className="block rounded-md px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-950">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate font-medium">{incident.subject}</p>
                                    <Badge variant={incident.priority === 'urgent' || incident.priority === 'high' ? 'destructive' : 'outline'}>
                                        {t(`incident_priorities.${incident.priority}`)}
                                    </Badge>
                                </div>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    {t(`incident_statuses.${incident.status}`)} / {t(`incident_types.${incident.type}`)}
                                </p>
                            </Link>
                        ))}
                    </ActivityPanel>
                </section>

                <ContextualHelp title={t('admin.help_title')}>
                    {t('admin.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function DashboardSection({
    title,
    items,
}: {
    title: string;
    items: {
        label: string;
        value: number;
        href: string;
        icon: LucideIcon;
    }[];
}) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {items.map((item) => (
                    <Link key={item.label} href={item.href} className="rounded-md border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-slate-800 dark:hover:border-emerald-900 dark:hover:bg-emerald-950/20">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                            <item.icon className="size-5 text-emerald-700 dark:text-emerald-300" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold">{item.value}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

function ActivityPanel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">{title}</h2>
            <div className="grid gap-1">{children}</div>
        </section>
    );
}

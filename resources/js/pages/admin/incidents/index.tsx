import { Head, Link, router } from '@inertiajs/react';
import { Eye, Filter, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AdminPagination } from '@/components/admin-pagination';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type Incident = {
    id: number;
    type: string;
    status: string;
    priority: string;
    subject: string;
    created_at: string;
    reporter?: { name: string; email: string } | null;
    reported_user?: { name: string; email: string } | null;
    teaching_offer?: { title: string; slug: string } | null;
    application?: { id: number; status: string } | null;
    class_session?: { id: number; title: string; status: string; starts_at?: string | null } | null;
};

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    incidents: Paginator<Incident>;
    filters: {
        search: string;
        status: string;
        type: string;
        priority: string;
        reporter_user_id: number | string;
        reported_user_id: number | string;
        teaching_offer_id: number | string;
    };
    statuses: string[];
    types: string[];
    priorities: string[];
    filterOptions: {
        reporters: Array<{ id: number; name: string; email: string }>;
        reportedUsers: Array<{ id: number; name: string; email: string }>;
        teachingOffers: Array<{ id: number; title: string; slug: string }>;
    };
};

export default function AdminIncidentsIndex({ incidents, filters, statuses, types, priorities, filterOptions }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        ...filters,
        reporter_user_id: filters.reporter_user_id ? String(filters.reporter_user_id) : '',
        reported_user_id: filters.reported_user_id ? String(filters.reported_user_id) : '',
        teaching_offer_id: filters.teaching_offer_id ? String(filters.teaching_offer_id) : '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/incidents', form, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('admin_incidents.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_incidents.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_incidents.intro')}</p>
                        </div>
                    </div>
                </section>

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_repeat(3,12rem)_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('admin_incidents.search')}</Label>
                        <Input id="search" value={form.search} onChange={(event) => setForm({ ...form, search: event.target.value })} />
                    </div>
                    <IncidentSelect label={t('admin_incidents.status')} value={form.status} values={['all', ...statuses]} prefix="incident_statuses" onChange={(value) => setForm({ ...form, status: value })} />
                    <IncidentSelect label={t('admin_incidents.type')} value={form.type} values={['all', ...types]} prefix="incident_types" onChange={(value) => setForm({ ...form, type: value })} />
                    <IncidentSelect label={t('admin_incidents.priority')} value={form.priority} values={['all', ...priorities]} prefix="incident_priorities" onChange={(value) => setForm({ ...form, priority: value })} />
                    <div className="flex items-end">
                        <Button type="submit" className="w-full">
                            <Filter />
                            {t('admin_incidents.apply_filters')}
                        </Button>
                    </div>
                    <UserSelect label={t('admin_incidents.reporter')} value={form.reporter_user_id} options={filterOptions.reporters} onChange={(value) => setForm({ ...form, reporter_user_id: value })} />
                    <UserSelect label={t('admin_incidents.reported_user')} value={form.reported_user_id} options={filterOptions.reportedUsers} onChange={(value) => setForm({ ...form, reported_user_id: value })} />
                    <OfferSelect label={t('admin_incidents.related_offer')} value={form.teaching_offer_id} options={filterOptions.teachingOffers} onChange={(value) => setForm({ ...form, teaching_offer_id: value })} />
                </form>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_incidents.subject')}</th>
                                    <th className="px-4 py-3">{t('admin_incidents.type')}</th>
                                    <th className="px-4 py-3">{t('admin_incidents.priority')}</th>
                                    <th className="px-4 py-3">{t('admin_incidents.status')}</th>
                                    <th className="px-4 py-3">{t('admin_incidents.reporter')}</th>
                                    <th className="px-4 py-3">{t('admin_incidents.reported_user')}</th>
                                    <th className="px-4 py-3">{t('admin_incidents.related')}</th>
                                    <th className="px-4 py-3">{t('admin_incidents.created')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_incidents.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {incidents.data.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                                            {t('admin_incidents.empty')}
                                        </td>
                                    </tr>
                                )}
                                {incidents.data.map((incident) => (
                                    <tr key={incident.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium">{incident.subject}</p>
                                            {incident.teaching_offer && (
                                                <p className="mt-1 text-xs text-muted-foreground">{incident.teaching_offer.title}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">{t(`incident_types.${incident.type}`)}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={incident.priority === 'urgent' || incident.priority === 'high' ? 'destructive' : 'outline'}>
                                                {t(`incident_priorities.${incident.priority}`)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={incident.status === 'open' || incident.status === 'in_review' ? 'default' : 'outline'}>
                                                {t(`incident_statuses.${incident.status}`)}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">{incident.reporter?.name ?? incident.reporter?.email ?? t('common.none')}</td>
                                        <td className="px-4 py-4">{incident.reported_user?.name ?? incident.reported_user?.email ?? t('common.none')}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{relatedLabel(incident, t)}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{new Date(incident.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-4 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/incidents/${incident.id}`}>
                                                    <Eye />
                                                    {t('actions.view')}
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <AdminPagination links={incidents.links} />

                <ContextualHelp title={t('admin_incidents.help_title')}>
                    {t('admin_incidents.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function relatedLabel(incident: Incident, t: (key: string) => string): string {
    if (incident.teaching_offer) {
        return incident.teaching_offer.title;
    }

    if (incident.application) {
        return `${t('admin_incidents.application')} #${incident.application.id}`;
    }

    if (incident.class_session) {
        return incident.class_session.title;
    }

    return t('common.none');
}

function UserSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: Array<{ id: number; name: string; email: string }>;
    onChange: (value: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">{t('common.all')}</option>
                {options.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                        {user.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

function OfferSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: Array<{ id: number; title: string; slug: string }>;
    onChange: (value: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">{t('common.all')}</option>
                {options.map((offer) => (
                    <option key={offer.id} value={String(offer.id)}>
                        {offer.title}
                    </option>
                ))}
            </select>
        </div>
    );
}

function IncidentSelect({
    label,
    value,
    values,
    prefix,
    onChange,
}: {
    label: string;
    value: string;
    values: string[];
    prefix: string;
    onChange: (value: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                {values.map((item) => (
                    <option key={item} value={item}>
                        {item === 'all' ? t('common.all') : t(`${prefix}.${item}`)}
                    </option>
                ))}
            </select>
        </div>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import { CalendarRange, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { AdminPagination } from '@/components/admin-pagination';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Session = {
    id: number;
    title: string;
    starts_at: string | null;
    status: string;
    capacity: number;
    enrolled_attendees_count: number;
    created_at: string;
    teacher: { name: string; email: string; country_code?: string | null; avatar?: string | null };
    offer: { title: string; slug: string };
};

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    sessions: Paginator<Session>;
    filters: {
        status: string;
        search: string;
        date_from: string;
        date_to: string;
    };
};

export default function AdminSessions({ sessions, filters }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const [form, setForm] = useState(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/sessions', form, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('admin_sessions.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <CalendarRange className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_sessions.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_sessions.intro')}</p>
                        </div>
                    </div>
                </section>

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_12rem_12rem_12rem_auto]">
                    <Field label={t('admin_sessions.search')}>
                        <Input value={form.search} onChange={(event) => setForm({ ...form, search: event.target.value })} placeholder={t('admin_sessions.search_placeholder')} />
                    </Field>
                    <Field label={t('admin_sessions.status')}>
                        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                            {['all', 'scheduled', 'completed', 'cancelled', 'no_show'].map((status) => (
                                <option key={status} value={status}>{status === 'all' ? t('common.all') : t(`session_statuses.${status}`)}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label={t('admin_sessions.date_from')}>
                        <Input type="date" value={form.date_from} onChange={(event) => setForm({ ...form, date_from: event.target.value })} />
                    </Field>
                    <Field label={t('admin_sessions.date_to')}>
                        <Input type="date" value={form.date_to} onChange={(event) => setForm({ ...form, date_to: event.target.value })} />
                    </Field>
                    <div className="flex items-end">
                        <Button className="w-full">
                            <Search />
                            {t('admin_sessions.apply_filters')}
                        </Button>
                    </div>
                </form>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_sessions.session')}</th>
                                    <th className="px-4 py-3">{t('admin_sessions.teacher')}</th>
                                    <th className="px-4 py-3">{t('admin_sessions.starts_at')}</th>
                                    <th className="px-4 py-3">{t('admin_sessions.status')}</th>
                                    <th className="px-4 py-3">{t('admin_sessions.capacity')}</th>
                                    <th className="px-4 py-3">{t('admin_sessions.country')}</th>
                                    <th className="px-4 py-3">{t('admin_sessions.created')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t('admin_sessions.empty')}</td>
                                    </tr>
                                )}
                                {sessions.data.map((session) => (
                                    <tr key={session.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium">{session.title}</p>
                                            <Link href={`/offers/${session.offer.slug}`} className="text-xs text-emerald-700 hover:underline dark:text-emerald-300">{session.offer.title}</Link>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={session.teacher.avatar ?? undefined} alt={session.teacher.name} />
                                                    <AvatarFallback>{getInitials(session.teacher.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{session.teacher.name}</p>
                                                    <p className="text-xs text-muted-foreground">{session.teacher.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">{session.starts_at ? new Date(session.starts_at).toLocaleString() : '-'}</td>
                                        <td className="px-4 py-4"><Badge>{t(`session_statuses.${session.status}`)}</Badge></td>
                                        <td className="px-4 py-4">{session.enrolled_attendees_count} / {session.capacity}</td>
                                        <td className="px-4 py-4">{session.teacher.country_code ?? '-'}</td>
                                        <td className="px-4 py-4">{new Date(session.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <AdminPagination links={sessions.links} />

                <ContextualHelp title={t('admin_sessions.help_title')}>
                    {t('admin_sessions.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
        </div>
    );
}

AdminSessions.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.sessions',
            href: '/admin/sessions',
        },
    ],
};

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FileText, ShieldAlert } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Incident = {
    id: number;
    type: string;
    status: string;
    priority: string;
    subject: string;
    description: string;
    admin_notes?: string | null;
    created_at: string;
    updated_at: string;
    reporter?: { id: number; name: string; email: string } | null;
    reported_user?: { id: number; name: string; email: string } | null;
    teaching_offer?: { title: string; slug: string } | null;
    application?: { id: number; status: string; message?: string | null; student?: { name: string; email: string } | null; teacher?: { name: string; email: string } | null } | null;
    class_session?: { id: number; title: string; status: string; starts_at?: string | null; ends_at?: string | null; timezone?: string | null } | null;
    resolver?: { name: string; email: string } | null;
    resolved_at?: string | null;
};

type Props = {
    incident: Incident;
    statuses: string[];
    priorities: string[];
};

export default function AdminIncidentShow({ incident, statuses, priorities }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm({
        status: incident.status,
        priority: incident.priority,
        admin_notes: incident.admin_notes ?? '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/incidents/${incident.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_incidents.detail_meta_title', { incident: incident.subject })} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{incident.subject}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_incidents.detail_intro')}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge>{t(`incident_statuses.${incident.status}`)}</Badge>
                                <Badge variant={incident.priority === 'urgent' || incident.priority === 'high' ? 'destructive' : 'outline'}>
                                    {t(`incident_priorities.${incident.priority}`)}
                                </Badge>
                                <Badge variant="outline">{t(`incident_types.${incident.type}`)}</Badge>
                            </div>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
                    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-3 text-lg font-semibold">{t('admin_incidents.description')}</h2>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{incident.description}</p>
                        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                            <Info label={t('admin_incidents.reporter')} value={incident.reporter?.name ?? incident.reporter?.email ?? t('common.none')} href={incident.reporter ? `/admin/users/${incident.reporter.id}` : undefined} />
                            <Info label={t('admin_incidents.reported_user')} value={incident.reported_user?.name ?? incident.reported_user?.email ?? t('common.none')} href={incident.reported_user ? `/admin/users/${incident.reported_user.id}` : undefined} />
                            <Info label={t('admin_incidents.teaching_offer')} value={incident.teaching_offer?.title ?? t('common.none')} href={incident.teaching_offer ? `/admin/teaching-offers/${incident.teaching_offer.slug}` : undefined} />
                            <Info label={t('admin_incidents.application')} value={incident.application ? `#${incident.application.id} - ${t(`application_statuses.${incident.application.status}`)}` : t('common.none')} />
                            <Info label={t('admin_incidents.session')} value={incident.class_session ? `${incident.class_session.title} - ${t(`session_statuses.${incident.class_session.status}`)}` : t('common.none')} />
                            <Info label={t('admin_incidents.created')} value={new Date(incident.created_at).toLocaleString()} />
                            <Info label={t('admin_incidents.updated_at')} value={new Date(incident.updated_at).toLocaleString()} />
                            <Info label={t('admin_incidents.resolved_by')} value={incident.resolver?.name ?? t('common.none')} />
                            <Info label={t('admin_incidents.resolved_at')} value={incident.resolved_at ? new Date(incident.resolved_at).toLocaleString() : t('common.none')} />
                        </div>
                    </article>

                    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <FileText className="size-5 text-emerald-700 dark:text-emerald-300" />
                            <h2 className="text-lg font-semibold">{t('admin_incidents.admin_review')}</h2>
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin_incidents.status')}</Label>
                            <select value={form.data.status} onChange={(event) => form.setData('status', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                                {statuses.map((status) => (
                                    <option key={status} value={status}>{t(`incident_statuses.${status}`)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {statuses.map((status) => (
                                <Button key={status} type="button" size="sm" variant={form.data.status === status ? 'default' : 'outline'} onClick={() => form.setData('status', status)}>
                                    {t(`incident_statuses.${status}`)}
                                </Button>
                            ))}
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('admin_incidents.priority')}</Label>
                            <select value={form.data.priority} onChange={(event) => form.setData('priority', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                                {priorities.map((priority) => (
                                    <option key={priority} value={priority}>{t(`incident_priorities.${priority}`)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="admin_notes">{t('admin_incidents.admin_notes')}</Label>
                            <Textarea id="admin_notes" value={form.data.admin_notes} onChange={(event) => form.setData('admin_notes', event.target.value)} rows={7} />
                        </div>
                        <Button type="submit" disabled={form.processing}>{t('actions.save')}</Button>
                    </form>
                </section>

                <ContextualHelp title={t('admin_incidents.detail_help_title')}>
                    {t('admin_incidents.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
    const content = (
        <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
        </div>
    );

    return href ? <Link href={href}>{content}</Link> : content;
}

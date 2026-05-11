import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Ban,
    LogIn,
    ShieldOff,
    ShieldX,
    UserCog,
    UserRoundCheck,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import type { Auth } from '@/types';

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    initials?: string;
    role: string;
    preferred_locale: string;
    timezone: string;
    country_code?: string | null;
    city?: string | null;
    email_verified_at: string | null;
    google_id?: string | null;
    banned_at?: string | null;
    banned_reason?: string | null;
    blocked_at?: string | null;
    blocked_reason?: string | null;
    last_login_at?: string | null;
    last_login_ip?: string | null;
    created_at: string;
    student_profile?: Record<string, unknown> | null;
    teacher_profile?: Record<string, unknown> | null;
    user_languages?: { id: number; language?: { name: string; code: string }; level: string | null; teaches: boolean; speaks: boolean; understands: boolean }[];
    teaching_offers?: { id: number; title: string; slug: string; is_active: boolean }[];
    learning_applications?: { id: number; status: string; offer?: { title: string; slug: string } }[];
    reported_incidents?: { id: number; subject: string; status: string; priority: string }[];
};

type Props = {
    managedUser: ManagedUser;
    summary: {
        teaching_offers_count: number;
        learning_applications_count: number;
        pending_applications_count: number;
        incidents_count: number;
    };
};

export default function AdminUserShow({ managedUser, summary }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const { auth, flash } = usePage().props as { auth: Auth; flash: { status?: string } };
    const [reason, setReason] = useState('');
    const displayName = managedUser.name || managedUser.email;
    const isSelf = auth.user?.id === managedUser.id;
    const isAdminTarget = managedUser.role === 'admin';

    const form = useForm({
        name: managedUser.name,
        preferred_locale: managedUser.preferred_locale,
        timezone: managedUser.timezone,
        country_code: managedUser.country_code ?? '',
        city: managedUser.city ?? '',
        email_verified: Boolean(managedUser.email_verified_at),
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/users/${managedUser.id}`, { preserveScroll: true });
    };

    const postAction = (action: 'ban' | 'unban' | 'block' | 'unblock') => {
        if (!window.confirm(t(`admin_users.confirm_${action}`))) {
            return;
        }

        router.post(
            `/admin/users/${managedUser.id}/${action}`,
            { reason },
            {
                preserveScroll: true,
                onSuccess: () => setReason(''),
            },
        );
    };

    const startImpersonation = () => {
        if (!window.confirm(t('admin_users.confirm_impersonate'))) {
            return;
        }

        router.post(`/admin/users/${managedUser.id}/impersonate`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('admin_users.detail_meta_title', { user: displayName })} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                            <Avatar className="size-16">
                                <AvatarImage src={managedUser.avatar ?? undefined} alt={displayName} />
                                <AvatarFallback>{managedUser.initials ?? getInitials(displayName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-normal">{displayName}</h1>
                                <p className="mt-1 text-sm text-muted-foreground">{managedUser.email}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge variant={managedUser.role === 'admin' ? 'default' : 'outline'}>{t(`admin_user_roles.${managedUser.role}`)}</Badge>
                                    {managedUser.google_id && <Badge variant="outline">{t('admin_profile_filters.google')}</Badge>}
                                    {managedUser.banned_at && <Badge variant="destructive">{t('admin_user_statuses.banned')}</Badge>}
                                    {managedUser.blocked_at && <Badge variant="destructive">{t('admin_user_statuses.blocked')}</Badge>}
                                </div>
                            </div>
                        </div>
                        {!isSelf && !isAdminTarget && !managedUser.banned_at && !managedUser.blocked_at && (
                            <Button type="button" onClick={startImpersonation}>
                                <LogIn />
                                {t('admin_users.impersonate')}
                            </Button>
                        )}
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label={t('admin_users.teaching_offers')} value={summary.teaching_offers_count} />
                    <SummaryCard label={t('admin_users.learning_applications')} value={summary.learning_applications_count} />
                    <SummaryCard label={t('admin_users.pending_applications')} value={summary.pending_applications_count} />
                    <SummaryCard label={t('admin_users.incidents')} value={summary.incidents_count} />
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr_22rem]">
                    <form onSubmit={submit} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-2">
                            <UserCog className="size-5 text-emerald-700 dark:text-emerald-300" />
                            <h2 className="text-lg font-semibold">{t('admin_users.basic_information')}</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label={t('profile_preferences.name')} value={form.data.name} onChange={(value) => form.setData('name', value)} error={form.errors.name} />
                            <Field label={t('profile_preferences.preferred_locale')} value={form.data.preferred_locale} onChange={(value) => form.setData('preferred_locale', value)} error={form.errors.preferred_locale} />
                            <Field label={t('profile_preferences.timezone')} value={form.data.timezone} onChange={(value) => form.setData('timezone', value)} error={form.errors.timezone} />
                            <Field label={t('admin_users.country_code')} value={form.data.country_code} onChange={(value) => form.setData('country_code', value.toUpperCase())} error={form.errors.country_code} />
                            <Field label={t('admin_users.city')} value={form.data.city} onChange={(value) => form.setData('city', value)} error={form.errors.city} />
                            <label className="flex items-center gap-2 pt-7 text-sm">
                                <Checkbox checked={form.data.email_verified} onCheckedChange={(checked) => form.setData('email_verified', Boolean(checked))} />
                                {t('admin_users.email_verified')}
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.processing}>
                                <UserRoundCheck />
                                {t('actions.save')}
                            </Button>
                        </div>
                    </form>

                    <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div>
                            <h2 className="text-lg font-semibold">{t('admin_users.admin_actions')}</h2>
                            <p className="mt-2 text-sm text-muted-foreground">{t('admin_users.admin_actions_intro')}</p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">{t('admin_users.reason')}</Label>
                            <Input id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder={t('admin_users.reason_placeholder')} />
                        </div>
                        <div className="grid gap-2">
                            {managedUser.banned_at ? (
                                <Button variant="outline" type="button" onClick={() => postAction('unban')} disabled={isSelf}>
                                    <ShieldOff />
                                    {t('admin_users.unban')}
                                </Button>
                            ) : (
                                <Button variant="outline" type="button" onClick={() => postAction('ban')} disabled={isSelf || isAdminTarget}>
                                    <Ban />
                                    {t('admin_users.ban')}
                                </Button>
                            )}
                            {managedUser.blocked_at ? (
                                <Button variant="outline" type="button" onClick={() => postAction('unblock')} disabled={isSelf}>
                                    <ShieldOff />
                                    {t('admin_users.unblock')}
                                </Button>
                            ) : (
                                <Button variant="outline" type="button" onClick={() => postAction('block')} disabled={isSelf || isAdminTarget}>
                                    <ShieldX />
                                    {t('admin_users.block')}
                                </Button>
                            )}
                        </div>
                        {(isSelf || isAdminTarget) && (
                            <p className="text-xs text-muted-foreground">{t('admin_users.protected_admin_note')}</p>
                        )}
                    </section>
                </section>

                <section className="grid gap-6 xl:grid-cols-3">
                    <InfoPanel title={t('admin_users.languages')}>
                        {(managedUser.user_languages ?? []).map((language) => (
                            <div key={language.id} className="rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                                <p className="font-medium">{language.language?.name ?? t('common.none')}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {language.level ? t(`language_levels.${language.level}`) : t('profile_preferences.no_level')}
                                </p>
                            </div>
                        ))}
                    </InfoPanel>
                    <InfoPanel title={t('admin_users.teaching_offers')}>
                        {(managedUser.teaching_offers ?? []).map((offer) => (
                            <Link key={offer.id} href={`/admin/teaching-offers/${offer.slug}`} className="block rounded-md border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950">
                                <p className="font-medium">{offer.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{offer.is_active ? t('statuses.active') : t('statuses.inactive')}</p>
                            </Link>
                        ))}
                    </InfoPanel>
                    <InfoPanel title={t('admin_users.incidents')}>
                        {(managedUser.reported_incidents ?? []).map((incident) => (
                            <Link key={incident.id} href={`/admin/incidents/${incident.id}`} className="block rounded-md border border-slate-200 p-3 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950">
                                <p className="font-medium">{incident.subject}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{t(`incident_statuses.${incident.status}`)}</p>
                            </Link>
                        ))}
                    </InfoPanel>
                </section>

                <ContextualHelp title={t('admin_users.detail_help_title')}>
                    {t('admin_users.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
        </article>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <Input value={value} onChange={(event) => onChange(event.target.value)} />
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-lg font-semibold">{title}</h2>
            <div className="grid gap-2">{children}</div>
        </section>
    );
}

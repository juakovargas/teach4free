import { Head, Link, router, usePage } from '@inertiajs/react';
import { Ban, Eye, Search, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AdminPagination } from '@/components/admin-pagination';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    initials?: string;
    role: string;
    country_code?: string | null;
    city?: string | null;
    email_verified_at: string | null;
    google_id?: string | null;
    banned_at?: string | null;
    blocked_at?: string | null;
    last_login_at?: string | null;
    created_at: string;
    teaching_offers_count: number;
    learning_applications_count: number;
    student_profile?: { is_active: boolean } | null;
    teacher_profile?: { is_active: boolean; is_verified: boolean } | null;
};

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    users: Paginator<ManagedUser>;
    filters: {
        search: string;
        role: string;
        status: string;
        email: string;
        profile: string;
        country: string;
    };
    countries: string[];
};

export default function AdminUsersIndex({ users, filters, countries }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const { flash } = usePage().props as { flash: { status?: string } };
    const [form, setForm] = useState(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/users', form, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title={t('admin_users.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Users className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_users.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_users.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1.5fr_repeat(5,1fr)_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('admin_users.search')}</Label>
                        <Input
                            id="search"
                            value={form.search}
                            onChange={(event) => setForm({ ...form, search: event.target.value })}
                            placeholder={t('admin_users.search_placeholder')}
                        />
                    </div>
                    <FilterSelect label={t('admin_users.role')} value={form.role} onChange={(value) => setForm({ ...form, role: value })} options={['all', 'admin', 'user']} prefix="admin_user_roles" />
                    <FilterSelect label={t('admin_users.status')} value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={['all', 'active', 'banned', 'blocked']} prefix="admin_user_statuses" />
                    <FilterSelect label={t('admin_users.email_status')} value={form.email} onChange={(value) => setForm({ ...form, email: value })} options={['all', 'verified', 'unverified']} prefix="admin_email_statuses" />
                    <FilterSelect label={t('admin_users.profile')} value={form.profile} onChange={(value) => setForm({ ...form, profile: value })} options={['all', 'student', 'teacher', 'both', 'google']} prefix="admin_profile_filters" />
                    <CountrySelect value={form.country} onChange={(value) => setForm({ ...form, country: value })} countries={countries} />
                    <div className="flex items-end">
                        <Button type="submit" className="w-full">
                            <Search />
                            {t('admin_users.apply_filters')}
                        </Button>
                    </div>
                </form>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_users.user')}</th>
                                    <th className="px-4 py-3">{t('admin_users.role')}</th>
                                    <th className="px-4 py-3">{t('admin_users.country')}</th>
                                    <th className="px-4 py-3">{t('admin_users.email_verified')}</th>
                                    <th className="px-4 py-3">{t('admin_users.learning_status')}</th>
                                    <th className="px-4 py-3">{t('admin_users.teaching_status')}</th>
                                    <th className="px-4 py-3">{t('admin_users.banned_status')}</th>
                                    <th className="px-4 py-3">{t('admin_users.blocked_status')}</th>
                                    <th className="px-4 py-3">{t('admin_users.last_login')}</th>
                                    <th className="px-4 py-3">{t('admin_users.created')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_users.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="px-4 py-8 text-center text-muted-foreground">
                                            {t('admin_users.empty')}
                                        </td>
                                    </tr>
                                )}
                                {users.data.map((user) => {
                                    const displayName = user.name || user.email;

                                    return (
                                        <tr key={user.id} className="border-b last:border-0">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-10">
                                                        <AvatarImage src={user.avatar ?? undefined} alt={displayName} />
                                                        <AvatarFallback>{user.initials ?? getInitials(displayName)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{displayName}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                                                    {t(`admin_user_roles.${user.role}`)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="min-w-24">
                                                    <p>{user.country_code ?? t('common.none')}</p>
                                                    {user.city && <p className="text-xs text-muted-foreground">{user.city}</p>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={user.email_verified_at ? 'default' : 'outline'}>
                                                    {t(user.email_verified_at ? 'admin_email_statuses.verified' : 'admin_email_statuses.unverified')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                {user.student_profile?.is_active ? t('statuses.active') : t('statuses.inactive')}
                                            </td>
                                            <td className="px-4 py-4">
                                                {user.teacher_profile?.is_active ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        {t('statuses.active')}
                                                        {user.teacher_profile.is_verified && <ShieldCheck className="size-4 text-emerald-700" />}
                                                    </span>
                                                ) : (
                                                    t('statuses.inactive')
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {user.banned_at ? <Badge variant="destructive">{t('admin_user_statuses.banned')}</Badge> : <Badge variant="outline">{t('admin_users.not_banned')}</Badge>}
                                            </td>
                                            <td className="px-4 py-4">
                                                {user.blocked_at ? <Badge variant="destructive">{t('admin_user_statuses.blocked')}</Badge> : <Badge variant="outline">{t('admin_users.not_blocked')}</Badge>}
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : t('admin_users.never_logged_in')}
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/users/${user.id}`}>
                                                            <Eye />
                                                            {t('actions.view')}
                                                        </Link>
                                                    </Button>
                                                    {(user.banned_at || user.blocked_at) && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/admin/users/${user.id}`}>
                                                                <Ban />
                                                                {t('admin_users.review_status')}
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <AdminPagination links={users.links} />

                <ContextualHelp title={t('admin_users.help_title')}>
                    {t('admin_users.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function FilterSelect({
    label,
    value,
    onChange,
    options,
    prefix,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    prefix: string;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {t(`${prefix}.${option}`)}
                    </option>
                ))}
            </select>
        </div>
    );
}

function CountrySelect({
    value,
    onChange,
    countries,
}: {
    value: string;
    onChange: (value: string) => void;
    countries: string[];
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-2">
            <Label>{t('admin_users.country')}</Label>
            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
                <option value="all">{t('admin_users.all_countries')}</option>
                {countries.map((country) => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </select>
        </div>
    );
}

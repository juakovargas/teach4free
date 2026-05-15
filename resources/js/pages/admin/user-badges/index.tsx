import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Award, Filter, RotateCcw, ShieldOff } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { PublicBadge } from '@/components/badges/badge-display';
import { BadgeIcon } from '@/components/badges/badge-display';
import { useBadgeText } from '@/components/badges/badge-display';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type UserSummary = {
    id: number | null;
    name: string | null;
    email: string | null;
    avatar: string | null;
    initials: string | null;
    admin_url: string | null;
};

type BadgeSummary = {
    id: number | null;
    key: string | null;
    name: string | null;
    description: string | null;
    icon: string | null;
    color: string | null;
    category: string | null;
};

type UserBadgeRow = {
    id: number;
    user: UserSummary;
    badge: BadgeSummary;
    awarded_at: string | null;
    awarded_reason: string | null;
    is_visible: boolean;
    is_featured: boolean;
    revoked_at: string | null;
    revoked_reason: string | null;
    revoked_by: { name: string; email: string } | null;
};

type BadgeOption = {
    id: number;
    key: string;
    name: string;
};

type Filters = {
    search: string;
    badge: string | number;
    status: string;
};

type Props = {
    userBadges: UserBadgeRow[];
    filters: Filters;
    badges: BadgeOption[];
    user: { id: number; name: string; email: string } | null;
};

export default function AdminUserBadgesIndex({
    userBadges,
    filters,
    badges,
    user,
}: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const text = useBadgeText();
    const [form, setForm] = useState<Filters>(filters);
    const [selected, setSelected] = useState<UserBadgeRow | null>(null);
    const revokeForm = useForm({ revoked_reason: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/user-badges', form, {
            preserveState: true,
            replace: true,
        });
    };

    const revoke = (event: FormEvent) => {
        event.preventDefault();

        if (!selected?.user.id || !selected.badge.id) {
            return;
        }

        revokeForm.post(
            `/admin/users/${selected.user.id}/badges/${selected.badge.id}/revoke`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    revokeForm.reset('revoked_reason');
                    setSelected(null);
                },
            },
        );
    };

    const badgePayload = (badge: BadgeSummary): PublicBadge => ({
        id: badge.id ?? 0,
        key: badge.key,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        category: badge.category,
        awarded_at: null,
    });

    return (
        <>
            <Head title={t('admin_user_badges.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Award className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {user
                                    ? t('admin_user_badges.user_title', {
                                          user: user.name,
                                      })
                                    : t('admin_user_badges.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin_user_badges.intro')}
                            </p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                {!user && (
                    <form
                        onSubmit={submit}
                        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_16rem_12rem_auto]"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="search">
                                {t('admin_user_badges.search')}
                            </Label>
                            <Input
                                id="search"
                                value={form.search}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        search: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="badge">
                                {t('admin_user_badges.badge')}
                            </Label>
                            <select
                                id="badge"
                                value={form.badge}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        badge: event.target.value,
                                    })
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">{t('common.all')}</option>
                                {badges.map((badge) => (
                                    <option key={badge.id} value={badge.id}>
                                        {text.name({
                                            id: badge.id,
                                            key: badge.key,
                                            name: badge.name,
                                            description: null,
                                            icon: null,
                                            color: null,
                                            category: null,
                                            awarded_at: null,
                                        })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">
                                {t('admin_user_badges.status')}
                            </Label>
                            <select
                                id="status"
                                value={form.status}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        status: event.target.value,
                                    })
                                }
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="all">{t('common.all')}</option>
                                <option value="active">
                                    {t('admin_user_badges.active')}
                                </option>
                                <option value="featured">
                                    {t('badges.featured')}
                                </option>
                                <option value="hidden">
                                    {t('badges.hidden')}
                                </option>
                                <option value="revoked">
                                    {t('badges.revoked')}
                                </option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <Button className="w-full">
                                <Filter />
                                {t('actions.filter')}
                            </Button>
                        </div>
                    </form>
                )}

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">
                                        {t('admin_user_badges.user')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_user_badges.badge')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_user_badges.awarded_at')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_user_badges.status')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_user_badges.reason')}
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        {t('admin_user_badges.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {userBadges.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            {t('admin_user_badges.empty')}
                                        </td>
                                    </tr>
                                )}
                                {userBadges.map((row) => {
                                    const revoked = Boolean(row.revoked_at);
                                    const reason =
                                        row.awarded_reason &&
                                        text.reason({
                                            ...badgePayload(row.badge),
                                            awarded_reason: row.awarded_reason,
                                        });

                                    return (
                                        <tr
                                            key={row.id}
                                            className="border-b align-top last:border-0"
                                        >
                                            <td className="px-4 py-4">
                                                {row.user.admin_url ? (
                                                    <Link
                                                        href={row.user.admin_url}
                                                        className="flex items-center gap-3 hover:text-emerald-700"
                                                    >
                                                        <Avatar className="size-9">
                                                            <AvatarImage
                                                                src={
                                                                    row.user
                                                                        .avatar ??
                                                                    undefined
                                                                }
                                                                alt={
                                                                    row.user
                                                                        .name ??
                                                                    ''
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {row.user
                                                                    .initials ??
                                                                    '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span>
                                                            <span className="block font-medium">
                                                                {row.user.name ??
                                                                    row.user
                                                                        .email}
                                                            </span>
                                                            <span className="block text-xs text-muted-foreground">
                                                                {row.user.email}
                                                            </span>
                                                        </span>
                                                    </Link>
                                                ) : (
                                                    t('common.none')
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-950">
                                                        <BadgeIcon
                                                            icon={row.badge.icon}
                                                            color={
                                                                row.badge.color
                                                            }
                                                            className="size-5"
                                                        />
                                                    </span>
                                                    <div>
                                                        <p className="font-medium">
                                                            {text.name(
                                                                badgePayload(
                                                                    row.badge,
                                                                ),
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {row.badge.key ??
                                                                t(
                                                                    'common.none',
                                                                )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {row.awarded_at
                                                    ? new Date(
                                                          row.awarded_at,
                                                      ).toLocaleDateString()
                                                    : t('common.none')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {revoked ? (
                                                        <Badge variant="destructive">
                                                            {t('badges.revoked')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            {t(
                                                                'admin_user_badges.active',
                                                            )}
                                                        </Badge>
                                                    )}
                                                    {!revoked &&
                                                        row.is_featured && (
                                                            <Badge variant="secondary">
                                                                {t(
                                                                    'badges.featured',
                                                                )}
                                                            </Badge>
                                                        )}
                                                    {!revoked &&
                                                        !row.is_visible && (
                                                            <Badge variant="outline">
                                                                {t(
                                                                    'badges.hidden',
                                                                )}
                                                            </Badge>
                                                        )}
                                                </div>
                                            </td>
                                            <td className="max-w-sm px-4 py-4 text-xs leading-5 text-muted-foreground">
                                                <p>{reason || t('common.none')}</p>
                                                {row.revoked_reason && (
                                                    <p className="mt-2">
                                                        {row.revoked_reason}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {revoked ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            asChild
                                                        >
                                                            <Link
                                                                href={`/admin/users/${row.user.id}/badges/${row.badge.id}/restore`}
                                                                method="post"
                                                                as="button"
                                                                preserveScroll
                                                            >
                                                                <RotateCcw />
                                                                {t(
                                                                    'actions.restore',
                                                                )}
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setSelected(row)
                                                            }
                                                        >
                                                            <ShieldOff />
                                                            {t(
                                                                'actions.revoke',
                                                            )}
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

                {selected && (
                    <form
                        onSubmit={revoke}
                        className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20"
                    >
                        <h2 className="font-semibold">
                            {t('admin_user_badges.revoke_title')}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {t('admin_user_badges.revoke_intro', {
                                badge: text.name(badgePayload(selected.badge)),
                                user:
                                    selected.user.name ??
                                    selected.user.email ??
                                    t('common.none'),
                            })}
                        </p>
                        <div className="mt-4 grid gap-2">
                            <Label htmlFor="revoked_reason">
                                {t('admin_user_badges.revoked_reason')}
                            </Label>
                            <Textarea
                                id="revoked_reason"
                                value={revokeForm.data.revoked_reason}
                                onChange={(event) =>
                                    revokeForm.setData(
                                        'revoked_reason',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={revokeForm.errors.revoked_reason}
                            />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button
                                variant="destructive"
                                disabled={revokeForm.processing}
                            >
                                <ShieldOff />
                                {t('actions.revoke')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSelected(null)}
                            >
                                {t('actions.cancel')}
                            </Button>
                        </div>
                    </form>
                )}

                <ContextualHelp title={t('admin_user_badges.help_title')}>
                    {t('admin_user_badges.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

AdminUserBadgesIndex.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.user_badges',
            href: '/admin/user-badges',
        },
    ],
};

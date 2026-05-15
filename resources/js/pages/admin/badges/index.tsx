import { Head, Link, router, usePage } from '@inertiajs/react';
import { Award, Edit, Filter, Plus } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import type { PublicBadge } from '@/components/badges/badge-display';
import { BadgeIcon } from '@/components/badges/badge-display';
import { useBadgeText } from '@/components/badges/badge-display';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type BadgeDefinition = {
    id: number;
    key: string;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    category: string;
    rule_type: string | null;
    threshold: number | null;
    is_active: boolean;
    is_public: boolean;
    sort_order: number;
    awarded_count: number;
    active_awarded_count: number;
    revoked_count: number;
};

type Filters = {
    search: string;
    category: string;
    status: string;
};

type Props = {
    badges: BadgeDefinition[];
    filters: Filters;
    categories: string[];
};

export default function AdminBadgesIndex({
    badges,
    filters,
    categories,
}: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const text = useBadgeText();
    const [form, setForm] = useState<Filters>(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/badges', form, {
            preserveState: true,
            replace: true,
        });
    };

    const badgeText = (badge: BadgeDefinition): PublicBadge => ({
        ...badge,
        awarded_at: null,
    });

    return (
        <>
            <Head title={t('admin_badges.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Award className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {t('admin_badges.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin_badges.intro')}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/admin/badges/create">
                            <Plus />
                            {t('admin_badges.create')}
                        </Link>
                    </Button>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_13rem_12rem_auto]"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="search">
                            {t('admin_badges.search')}
                        </Label>
                        <Input
                            id="search"
                            value={form.search}
                            onChange={(event) =>
                                setForm({ ...form, search: event.target.value })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">
                            {t('admin_badges.category')}
                        </Label>
                        <select
                            id="category"
                            value={form.category}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    category: event.target.value,
                                })
                            }
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="all">{t('common.all')}</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {t(`badge_categories.${category}`)}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">
                            {t('admin_badges.status')}
                        </Label>
                        <select
                            id="status"
                            value={form.status}
                            onChange={(event) =>
                                setForm({ ...form, status: event.target.value })
                            }
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="all">{t('common.all')}</option>
                            <option value="active">{t('statuses.active')}</option>
                            <option value="inactive">
                                {t('statuses.inactive')}
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

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">
                                        {t('admin_badges.name')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_badges.category')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_badges.rule')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_badges.awards')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_badges.visibility')}
                                    </th>
                                    <th className="px-4 py-3">
                                        {t('admin_badges.sort_order')}
                                    </th>
                                    <th className="px-4 py-3 text-right">
                                        {t('admin_badges.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {badges.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            {t('admin_badges.empty')}
                                        </td>
                                    </tr>
                                )}
                                {badges.map((badge) => (
                                    <tr
                                        key={badge.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-start gap-3">
                                                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-950">
                                                    <BadgeIcon
                                                        icon={badge.icon}
                                                        color={badge.color}
                                                        className="size-5"
                                                    />
                                                </span>
                                                <div>
                                                    <p className="font-medium">
                                                        {text.name(
                                                            badgeText(badge),
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {badge.key}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant="outline">
                                                {t(
                                                    `badge_categories.${badge.category}`,
                                                )}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">
                                            {badge.rule_type ?? t('common.none')}
                                            {badge.threshold !== null &&
                                                ` / ${badge.threshold}`}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="grid gap-1 text-xs">
                                                <span>
                                                    {t(
                                                        'admin_badges.active_awards_count',
                                                        {
                                                            count: badge.active_awarded_count,
                                                        },
                                                    )}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {t(
                                                        'admin_badges.revoked_count',
                                                        {
                                                            count: badge.revoked_count,
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                <Badge
                                                    variant={
                                                        badge.is_active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {t(
                                                        badge.is_active
                                                            ? 'statuses.active'
                                                            : 'statuses.inactive',
                                                    )}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {t(
                                                        badge.is_public
                                                            ? 'admin_badges.public'
                                                            : 'admin_badges.private',
                                                    )}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {badge.sort_order}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                >
                                                    <Link
                                                        href={`/admin/badges/${badge.id}/edit`}
                                                    >
                                                        <Edit />
                                                        {t('actions.edit')}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ContextualHelp title={t('admin_badges.help_title')}>
                    {t('admin_badges.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

AdminBadgesIndex.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.badges',
            href: '/admin/badges',
        },
    ],
};

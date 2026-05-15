import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Award, Eye, EyeOff, Save, Star } from 'lucide-react';
import type { FormEvent } from 'react';
import type { PublicBadge } from '@/components/badges/badge-display';
import { BadgeIcon } from '@/components/badges/badge-display';
import { useBadgeText } from '@/components/badges/badge-display';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/use-translation';

type ManagedBadge = {
    id: number;
    is_visible: boolean;
    is_featured: boolean;
};

type Props = {
    badges: PublicBadge[];
    featuredLimit: number;
    publicProfileUrl: string | null;
};

export default function TeacherBadgesPage({
    badges,
    featuredLimit,
    publicProfileUrl,
}: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const text = useBadgeText();
    const { data, setData, put, processing, errors } = useForm<{
        badges: ManagedBadge[];
    }>({
        badges: badges.map((badge) => ({
            id: badge.id,
            is_visible: badge.is_visible !== false && !badge.revoked_at,
            is_featured: badge.is_featured === true && !badge.revoked_at,
        })),
    });
    const featuredCount = data.badges.filter((badge) => badge.is_featured).length;

    const updateBadge = (id: number, changes: Partial<ManagedBadge>) => {
        setData(
            'badges',
            data.badges.map((badge) => {
                if (badge.id !== id) {
                    return badge;
                }

                const next = { ...badge, ...changes };

                if (changes.is_visible === false) {
                    next.is_featured = false;
                }

                if (changes.is_featured === true) {
                    next.is_visible = true;
                }

                return next;
            }),
        );
    };

    const stateFor = (id: number) =>
        data.badges.find((badge) => badge.id === id) ?? {
            id,
            is_visible: false,
            is_featured: false,
        };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put('/profile/teacher/badges', { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('teacher_badges.meta_title')} />
            <form onSubmit={submit} className="space-y-8 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                            <Award className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                            <div>
                                <h1 className="text-2xl font-semibold tracking-normal">
                                    {t('teacher_badges.title')}
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    {t('teacher_badges.intro')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {publicProfileUrl && (
                                <Button variant="outline" asChild>
                                    <Link href={publicProfileUrl}>
                                        <Eye />
                                        {t('teacher_badges.open_public_profile')}
                                    </Link>
                                </Button>
                            )}
                            <Button disabled={processing}>
                                <Save />
                                {t('actions.save')}
                            </Button>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}
                <InputError message={errors.badges} />

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">
                                {t('teacher_badges.earned_badges')}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t('teacher_badges.featured_limit', {
                                    count: featuredLimit,
                                })}
                            </p>
                        </div>
                        <Badge variant="outline" className="w-fit rounded-full">
                            {t('badges.featured_count', {
                                count: featuredCount,
                            })}
                        </Badge>
                    </div>

                    {badges.length === 0 ? (
                        <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-muted-foreground dark:border-slate-700 dark:bg-slate-950">
                            <p className="font-medium text-slate-950 dark:text-white">
                                {t('teacher_badges.empty_title')}
                            </p>
                            <p className="mt-2 leading-6">
                                {t('teacher_badges.empty_body')}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-4">
                            {badges.map((badge) => {
                                const current = stateFor(badge.id);
                                const revoked = Boolean(badge.revoked_at);
                                const canFeature =
                                    current.is_featured ||
                                    featuredCount < featuredLimit;
                                const reason = text.reason(badge);

                                return (
                                    <article
                                        key={badge.id}
                                        className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex items-start gap-3">
                                                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-950">
                                                    <BadgeIcon
                                                        icon={badge.icon}
                                                        color={badge.color}
                                                        className="size-5"
                                                    />
                                                </span>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="font-semibold">
                                                            {text.name(badge)}
                                                        </h3>
                                                        {revoked && (
                                                            <Badge variant="destructive">
                                                                {t('badges.revoked')}
                                                            </Badge>
                                                        )}
                                                        {!revoked &&
                                                            !current.is_visible && (
                                                                <Badge variant="outline">
                                                                    {t('badges.hidden')}
                                                                </Badge>
                                                            )}
                                                        {!revoked &&
                                                            current.is_featured && (
                                                                <Badge variant="secondary">
                                                                    {t('badges.featured')}
                                                                </Badge>
                                                            )}
                                                    </div>
                                                    {text.description(badge) && (
                                                        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                                                            {text.description(badge)}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                                        {badge.awarded_at && (
                                                            <p>
                                                                {t(
                                                                    'badges.awarded_on',
                                                                    {
                                                                        date: new Date(
                                                                            badge.awarded_at,
                                                                        ).toLocaleDateString(),
                                                                    },
                                                                )}
                                                            </p>
                                                        )}
                                                        {reason && <p>{reason}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:min-w-72">
                                                <label className="flex items-center gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                                                    <Checkbox
                                                        checked={
                                                            current.is_visible
                                                        }
                                                        disabled={revoked}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            updateBadge(
                                                                badge.id,
                                                                {
                                                                    is_visible:
                                                                        checked ===
                                                                        true,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <span className="flex items-center gap-2">
                                                        {current.is_visible ? (
                                                            <Eye className="size-4" />
                                                        ) : (
                                                            <EyeOff className="size-4" />
                                                        )}
                                                        {t(
                                                            'teacher_badges.visible_on_profile',
                                                        )}
                                                    </span>
                                                </label>
                                                <label className="flex items-center gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800">
                                                    <Checkbox
                                                        checked={
                                                            current.is_featured
                                                        }
                                                        disabled={
                                                            revoked || !canFeature
                                                        }
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            updateBadge(
                                                                badge.id,
                                                                {
                                                                    is_featured:
                                                                        checked ===
                                                                        true,
                                                                },
                                                            )
                                                        }
                                                    />
                                                    <span className="flex items-center gap-2">
                                                        <Star className="size-4" />
                                                        {t(
                                                            'teacher_badges.featured_badge',
                                                        )}
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

                <ContextualHelp title={t('teacher_badges.help_title')}>
                    {t('teacher_badges.help_body')}
                </ContextualHelp>

                <div className="flex flex-wrap gap-2">
                    <Button disabled={processing}>
                        <Save />
                        {t('actions.save')}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/profile/teacher">
                            {t('teacher_badges.back_to_profile')}
                        </Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

TeacherBadgesPage.layout = {
    breadcrumbs: [
        {
            title: 'navigation.teacher_profile',
            href: '/profile/teacher',
        },
        {
            title: 'navigation.teacher_badges',
            href: '/profile/teacher/badges',
        },
    ],
};

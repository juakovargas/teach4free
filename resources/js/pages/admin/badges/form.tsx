import { Head, Link, useForm } from '@inertiajs/react';
import { Award, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { BadgeIcon } from '@/components/badges/badge-display';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
};

type BadgeForm = {
    key: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    category: string;
    rule_type: string;
    threshold: number | '';
    is_active: boolean;
    is_public: boolean;
    sort_order: number;
};

type Props = {
    badge: BadgeDefinition | null;
    categories: string[];
};

const colorPresets = [
    '#0F766E',
    '#2563EB',
    '#7C3AED',
    '#059669',
    '#D97706',
    '#0891B2',
    '#4F46E5',
    '#DB2777',
    '#EA580C',
    '#64748B',
];

const iconSuggestions = [
    'Trophy',
    'Star',
    'HeartHandshake',
    'GraduationCap',
    'Clock',
    'Users',
    'ShieldCheck',
    'BookOpen',
    'Code2',
    'Languages',
    'Sparkles',
];

export default function AdminBadgeForm({ badge, categories }: Props) {
    const { t } = useTranslation();
    const isEditing = badge !== null;
    const { data, setData, post, put, processing, errors } =
        useForm<BadgeForm>({
            key: badge?.key ?? '',
            name: badge?.name ?? '',
            description: badge?.description ?? '',
            icon: badge?.icon ?? 'Trophy',
            color: badge?.color ?? '#0F766E',
            category: badge?.category ?? 'teaching',
            rule_type: badge?.rule_type ?? '',
            threshold: badge?.threshold ?? '',
            is_active: badge?.is_active ?? true,
            is_public: badge?.is_public ?? true,
            sort_order: badge?.sort_order ?? 0,
        });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isEditing) {
            put(`/admin/badges/${badge.id}`);

            return;
        }

        post('/admin/badges');
    };

    const color = /^#[0-9a-fA-F]{6}$/.test(data.color)
        ? data.color
        : '#0F766E';

    return (
        <>
            <Head
                title={
                    isEditing
                        ? t('admin_badges.edit_title')
                        : t('admin_badges.create_title')
                }
            />
            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Award className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {isEditing
                                    ? t('admin_badges.edit_title')
                                    : t('admin_badges.create_title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin_badges.form_intro')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('admin_badges.name')}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="key">{t('admin_badges.key')}</Label>
                        <Input
                            id="key"
                            value={data.key}
                            onChange={(event) =>
                                setData('key', event.target.value)
                            }
                        />
                        <InputError message={errors.key} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">
                            {t('admin_badges.category')}
                        </Label>
                        <select
                            id="category"
                            value={data.category}
                            onChange={(event) =>
                                setData('category', event.target.value)
                            }
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {t(`badge_categories.${category}`)}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="icon">{t('admin_badges.icon')}</Label>
                        <div className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800">
                                <BadgeIcon
                                    icon={data.icon}
                                    color={color}
                                    className="size-5"
                                />
                            </span>
                            <select
                                id="icon"
                                value={data.icon}
                                onChange={(event) =>
                                    setData('icon', event.target.value)
                                }
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {iconSuggestions.map((icon) => (
                                    <option key={icon} value={icon}>
                                        {icon}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <InputError message={errors.icon} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">{t('admin_badges.color')}</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="color_picker"
                                type="color"
                                value={color}
                                onChange={(event) =>
                                    setData(
                                        'color',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                className="h-10 w-14 p-1"
                                aria-label={t('admin_badges.color_picker')}
                            />
                            <Input
                                id="color"
                                value={data.color}
                                onChange={(event) =>
                                    setData(
                                        'color',
                                        event.target.value.toUpperCase(),
                                    )
                                }
                                placeholder="#0F766E"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {colorPresets.map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    className="size-8 rounded-full border border-slate-200 shadow-xs transition hover:scale-105 dark:border-slate-800"
                                    style={{ backgroundColor: preset }}
                                    onClick={() => setData('color', preset)}
                                    aria-label={preset}
                                />
                            ))}
                        </div>
                        <InputError message={errors.color} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort_order">
                            {t('admin_badges.sort_order')}
                        </Label>
                        <Input
                            id="sort_order"
                            type="number"
                            min={0}
                            value={data.sort_order}
                            onChange={(event) =>
                                setData('sort_order', Number(event.target.value))
                            }
                        />
                        <InputError message={errors.sort_order} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="rule_type">
                            {t('admin_badges.rule_type')}
                        </Label>
                        <Input
                            id="rule_type"
                            value={data.rule_type}
                            onChange={(event) =>
                                setData('rule_type', event.target.value)
                            }
                        />
                        <InputError message={errors.rule_type} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="threshold">
                            {t('admin_badges.threshold')}
                        </Label>
                        <Input
                            id="threshold"
                            type="number"
                            min={0}
                            value={data.threshold}
                            onChange={(event) =>
                                setData(
                                    'threshold',
                                    event.target.value === ''
                                        ? ''
                                        : Number(event.target.value),
                                )
                            }
                        />
                        <InputError message={errors.threshold} />
                    </div>
                    <label className="flex items-center gap-3 pt-8 text-sm font-medium">
                        <Checkbox
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked === true)
                            }
                        />
                        {t('admin_badges.active')}
                    </label>
                    <label className="flex items-center gap-3 pt-8 text-sm font-medium">
                        <Checkbox
                            checked={data.is_public}
                            onCheckedChange={(checked) =>
                                setData('is_public', checked === true)
                            }
                        />
                        {t('admin_badges.public')}
                    </label>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">
                            {t('admin_badges.description')}
                        </Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                        />
                        <InputError message={errors.description} />
                    </div>
                </section>

                <ContextualHelp title={t('admin_badges.help_title')}>
                    {t('admin_badges.help_body')}
                </ContextualHelp>

                <div className="flex gap-3">
                    <Button disabled={processing}>
                        <Save />
                        {t('actions.save')}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/badges">{t('actions.cancel')}</Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

AdminBadgeForm.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.badges',
            href: '/admin/badges',
        },
    ],
};

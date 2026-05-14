import { Head, Link, useForm } from '@inertiajs/react';
import { Library, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    category: Category | null;
};

type CategoryForm = {
    name: string;
    slug: string;
    description: string;
    color: string;
    icon: string;
    is_active: boolean;
    sort_order: number;
};

const colorPresets = ['#3B82F6', '#10B981', '#8B5CF6', '#F97316', '#EC4899', '#14B8A6', '#EF4444', '#EAB308', '#64748B', '#6366F1'];

export default function AdminCategoryForm({ category }: Props) {
    const { t } = useTranslation();
    const isEditing = category !== null;
    const { data, setData, post, put, processing, errors } = useForm<CategoryForm>({
        name: category?.name ?? '',
        slug: category?.slug ?? '',
        description: category?.description ?? '',
        color: category?.color ?? '#0f766e',
        icon: category?.icon ?? '',
        is_active: category?.is_active ?? true,
        sort_order: category?.sort_order ?? 0,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isEditing) {
            put(`/admin/categories/${category.id}`);

            return;
        }

        post('/admin/categories');
    };

    return (
        <>
            <Head title={isEditing ? t('admin_categories.edit_title') : t('admin_categories.create_title')} />
            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Library className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {isEditing ? t('admin_categories.edit_title') : t('admin_categories.create_title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin_categories.form_intro')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('admin_categories.name')}</Label>
                        <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">{t('admin_categories.slug')}</Label>
                        <Input id="slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} />
                        <InputError message={errors.slug} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="color">{t('admin_categories.color')}</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="color-picker"
                                type="color"
                                value={/^#[0-9a-fA-F]{6}$/.test(data.color) ? data.color : '#3B82F6'}
                                onChange={(event) => setData('color', event.target.value.toUpperCase())}
                                className="h-10 w-14 p-1"
                                aria-label={t('admin_categories.color_picker')}
                            />
                            <Input id="color" value={data.color} onChange={(event) => setData('color', event.target.value.toUpperCase())} placeholder="#3B82F6" />
                            <span className="size-10 rounded-md border border-slate-200 dark:border-slate-800" style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(data.color) ? data.color : '#FFFFFF' }} />
                        </div>
                        <div className="flex flex-wrap gap-2" aria-label={t('admin_categories.preset_palette')}>
                            {colorPresets.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setData('color', color)}
                                    className="size-8 rounded-full border border-slate-200 shadow-xs transition hover:scale-105 dark:border-slate-800"
                                    style={{ backgroundColor: color }}
                                    aria-label={color}
                                />
                            ))}
                        </div>
                        <InputError message={errors.color} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="icon">{t('admin_categories.icon')}</Label>
                        <Input id="icon" value={data.icon} onChange={(event) => setData('icon', event.target.value)} />
                        <InputError message={errors.icon} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort_order">{t('admin_categories.sort_order')}</Label>
                        <Input
                            id="sort_order"
                            type="number"
                            min="0"
                            value={data.sort_order}
                            onChange={(event) => setData('sort_order', Number(event.target.value))}
                        />
                        <InputError message={errors.sort_order} />
                    </div>
                    <label className="flex items-center gap-3 pt-8 text-sm font-medium">
                        <Checkbox checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked === true)} />
                        {t('admin_categories.active')}
                    </label>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">{t('admin_categories.description')}</Label>
                        <Textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        <InputError message={errors.description} />
                    </div>
                </section>

                <ContextualHelp title={t('admin_categories.help_title')}>
                    {t('admin_categories.help_body')}
                </ContextualHelp>

                <div className="flex gap-3">
                    <Button disabled={processing}>
                        <Save />
                        {t('actions.save')}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/categories">{t('actions.cancel')}</Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

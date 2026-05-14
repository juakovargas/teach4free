import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpenCheck, Edit, Filter, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type CategoryOption = {
    id: number;
    name: string;
    slug: string;
};

type Subject = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    offers_count: number;
    created_at: string;
    category: {
        name: string;
        color: string | null;
    };
};

type Props = {
    subjects: Subject[];
    categories: CategoryOption[];
    filters: {
        search: string;
        category: number | string;
        status: string;
    };
};

export default function AdminSubjects({ subjects, categories, filters }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const [form, setForm] = useState({
        search: filters.search,
        category: filters.category ? String(filters.category) : '',
        status: filters.status,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/subjects', form, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('admin_subjects.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <BookOpenCheck className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_subjects.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_subjects.intro')}</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/admin/subjects/create">
                            <Plus />
                            {t('admin_subjects.create')}
                        </Link>
                    </Button>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[1fr_14rem_12rem_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('admin_subjects.search')}</Label>
                        <Input id="search" value={form.search} onChange={(event) => setForm({ ...form, search: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">{t('admin_subjects.category')}</Label>
                        <select id="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="">{t('admin_subjects.all_categories')}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={String(category.id)}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">{t('admin_subjects.status')}</Label>
                        <select id="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="all">{t('common.all')}</option>
                            <option value="active">{t('statuses.active')}</option>
                            <option value="inactive">{t('statuses.inactive')}</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" className="w-full">
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
                                    <th className="px-4 py-3">{t('admin_subjects.name')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.category')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.slug')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.sort_order')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.offers')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.status')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.created_at')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_subjects.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">{t('admin_subjects.empty')}</td>
                                    </tr>
                                )}
                                {subjects.map((subject) => (
                                    <tr key={subject.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium">{subject.name}</p>
                                            {subject.description && (
                                                <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">{subject.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="size-3 rounded-full" style={{ backgroundColor: subject.category.color ?? '#0f766e' }} />
                                                {subject.category.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">{subject.slug}</td>
                                        <td className="px-4 py-4">{subject.sort_order}</td>
                                        <td className="px-4 py-4">{subject.offers_count}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={subject.is_active ? 'default' : 'outline'}>
                                                {t(subject.is_active ? 'statuses.active' : 'statuses.inactive')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">{new Date(subject.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/subjects/${subject.id}/edit`}>
                                                        <Edit />
                                                        {t('actions.edit')}
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/subjects/${subject.id}`} method="delete" as="button" preserveScroll>
                                                        <Trash2 />
                                                        {t('actions.deactivate')}
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

                <ContextualHelp title={t('admin_subjects.help_title')}>
                    {t('admin_subjects.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

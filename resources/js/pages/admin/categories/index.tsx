import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, Library, Plus, Trash2 } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    subjects_count: number;
    offers_count: number;
};

type Props = {
    categories: Category[];
};

export default function AdminCategories({ categories }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    return (
        <>
            <Head title={t('admin_categories.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Library className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {t('admin_categories.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin_categories.intro')}
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/admin/categories/create">
                            <Plus />
                            {t('admin_categories.create')}
                        </Link>
                    </Button>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_categories.name')}</th>
                                    <th className="px-4 py-3">{t('admin_categories.slug')}</th>
                                    <th className="px-4 py-3">{t('admin_categories.subjects')}</th>
                                    <th className="px-4 py-3">{t('admin_categories.offers')}</th>
                                    <th className="px-4 py-3">{t('admin_categories.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_categories.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr key={category.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: category.color ?? '#0f766e' }}
                                                />
                                                <div>
                                                    <p className="font-medium">{category.name}</p>
                                                    {category.description && (
                                                        <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                                                            {category.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">{category.slug}</td>
                                        <td className="px-4 py-4">{category.subjects_count}</td>
                                        <td className="px-4 py-4">{category.offers_count}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={category.is_active ? 'default' : 'outline'}>
                                                {t(category.is_active ? 'statuses.active' : 'statuses.inactive')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/categories/${category.id}/edit`}>
                                                        <Edit />
                                                        {t('actions.edit')}
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link
                                                        href={`/admin/categories/${category.id}`}
                                                        method="delete"
                                                        as="button"
                                                        preserveScroll
                                                    >
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

                <ContextualHelp title={t('admin_categories.help_title')}>
                    {t('admin_categories.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

AdminCategories.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.categories',
            href: '/admin/categories',
        },
    ],
};

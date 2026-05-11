import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpenCheck, Edit, Plus, Trash2 } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Subject = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    offers_count: number;
    category: {
        name: string;
        color: string | null;
    };
};

type Props = {
    subjects: Subject[];
};

export default function AdminSubjects({ subjects }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

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

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_subjects.name')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.category')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.slug')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.offers')}</th>
                                    <th className="px-4 py-3">{t('admin_subjects.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_subjects.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
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
                                        <td className="px-4 py-4">{subject.offers_count}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={subject.is_active ? 'default' : 'outline'}>
                                                {t(subject.is_active ? 'statuses.active' : 'statuses.inactive')}
                                            </Badge>
                                        </td>
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

import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, Languages, Plus } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Language = {
    id: number;
    code: string;
    name: string;
    native_name: string;
    is_active: boolean;
    sort_order: number;
    user_languages_count: number;
};

type Props = {
    languages: Language[];
};

export default function AdminLanguagesIndex({ languages }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };

    return (
        <>
            <Head title={t('admin_languages.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Languages className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_languages.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_languages.intro')}</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/admin/languages/create">
                            <Plus />
                            {t('admin_languages.create')}
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
                                    <th className="px-4 py-3">{t('admin_languages.language')}</th>
                                    <th className="px-4 py-3">{t('admin_languages.code')}</th>
                                    <th className="px-4 py-3">{t('admin_languages.users')}</th>
                                    <th className="px-4 py-3">{t('admin_languages.sort_order')}</th>
                                    <th className="px-4 py-3">{t('admin_languages.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_languages.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {languages.map((language) => (
                                    <tr key={language.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium">{language.name}</p>
                                            <p className="text-xs text-muted-foreground">{language.native_name}</p>
                                        </td>
                                        <td className="px-4 py-4">{language.code}</td>
                                        <td className="px-4 py-4">{language.user_languages_count}</td>
                                        <td className="px-4 py-4">{language.sort_order}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={language.is_active ? 'default' : 'outline'}>
                                                {t(language.is_active ? 'statuses.active' : 'statuses.inactive')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/languages/${language.id}/edit`}>
                                                    <Edit />
                                                    {t('actions.edit')}
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ContextualHelp title={t('admin_languages.help_title')}>
                    {t('admin_languages.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

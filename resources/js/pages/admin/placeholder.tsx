import { Head } from '@inertiajs/react';
import { Settings } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    titleKey: string;
    descriptionKey: string;
};

export default function AdminPlaceholder({ titleKey, descriptionKey }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t(titleKey)} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Settings className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t(titleKey)}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t(descriptionKey)}</p>
                        </div>
                    </div>
                </section>
                <ContextualHelp title={t('admin.placeholder_help_title')}>
                    {t('admin.placeholder_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

import { Head, Link } from '@inertiajs/react';
import { Presentation } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

export default function TeacherOfferNotReady() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('teacher_offers.not_ready_meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-amber-200 bg-white p-6 shadow-xs dark:border-amber-900/60 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Presentation className="mt-1 size-6 text-amber-700 dark:text-amber-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('teacher_offers.teacher_not_ready_title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('teacher_offers.teacher_not_ready_body')}</p>
                            <Button className="mt-5" asChild>
                                <Link href="/profile/teacher">{t('teacher_offers.activate_teacher_link')}</Link>
                            </Button>
                        </div>
                    </div>
                </section>
                <ContextualHelp title={t('teacher_offers.help_title')}>
                    {t('teacher_offers.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

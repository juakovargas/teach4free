import { Head } from '@inertiajs/react';
import { Globe2, HandHeart, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export default function About() {
    const { t } = useTranslation();

    const sections = [
        {
            icon: HandHeart,
            title: t('about.free_rule_title'),
            body: t('about.free_rule_body'),
        },
        {
            icon: ShieldCheck,
            title: t('about.roles_title'),
            body: t('about.roles_body'),
        },
        {
            icon: Globe2,
            title: t('about.language_title'),
            body: t('about.language_body'),
        },
    ];

    return (
        <>
            <Head title={t('about.meta_title')} />
            <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl dark:text-white">
                        {t('about.title')}
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-700 dark:text-slate-300">
                        {t('about.intro')}
                    </p>
                </div>

                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {sections.map((section) => (
                        <article
                            key={section.title}
                            className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                        >
                            <section.icon className="mb-5 size-6 text-emerald-700 dark:text-emerald-300" />
                            <h2 className="text-lg font-semibold">
                                {section.title}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                {section.body}
                            </p>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}

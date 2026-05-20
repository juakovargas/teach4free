import { Link } from '@inertiajs/react';
import { FileText, ShieldCheck } from 'lucide-react';
import { SeoHead } from '@/components/seo-head';
import type { SeoHeadProps } from '@/components/seo-head';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type ContentSection = {
    title: string;
    body?: string;
    items?: string[];
};

type Content = {
    meta_title: string;
    eyebrow: string;
    title: string;
    intro: string;
    sections: ContentSection[];
    closing?: string;
};

type Props = {
    pageKey: string;
    content: Content;
    seo: SeoHeadProps;
};

export default function ContentPage({ pageKey, content, seo }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <SeoHead {...seo} />
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_30rem),linear-gradient(180deg,#fffaf3_0%,#ffffff_44%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28rem),linear-gradient(180deg,#07140f_0%,#020617_55%)]">
                <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                    <section className="rounded-lg border border-white/80 bg-white/75 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                                {pageKey === 'terms' ? (
                                    <ShieldCheck className="size-6" />
                                ) : (
                                    <FileText className="size-6" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                    {content.eyebrow}
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl dark:text-white">
                                    {content.title}
                                </h1>
                                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                                    {content.intro}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-8 grid gap-4">
                        {content.sections.map((section) => (
                            <article
                                key={section.title}
                                className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                            >
                                <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
                                    {section.title}
                                </h2>
                                {section.body && (
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                        {section.body}
                                    </p>
                                )}
                                {section.items && (
                                    <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted-foreground">
                                        {section.items.map((item) => (
                                            <li key={item} className="flex gap-2">
                                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-600" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>
                        ))}
                    </section>

                    {content.closing && (
                        <section className="mt-8 rounded-lg border border-emerald-100 bg-emerald-50/70 p-6 text-sm leading-7 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
                            {content.closing}
                        </section>
                    )}

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild>
                            <Link href="/offers">
                                {t('navigation.find_free_classes')}
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/teachers">{t('navigation.browse_teachers')}</Link>
                        </Button>
                    </div>
                </main>
            </div>
        </>
    );
}

import { Head } from '@inertiajs/react';
import { Globe2, Map } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { useTranslation } from '@/hooks/use-translation';

type Country = {
    country_code: string;
    users_count: number;
    teachers_count: number;
    students_count: number;
    mixed_users_count: number;
    published_offers_count: number;
    pending_applications_count: number;
    percentage: number;
};

type Summary = {
    total_located_users: number;
    countries_represented: number;
    top_country_by_users: Country | null;
    top_country_by_teachers: Country | null;
    top_country_by_students: Country | null;
};

type Props = {
    countries: Country[];
    summary: Summary;
};

export default function AdminWorldMap({ countries, summary }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('admin_world_map.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Map className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_world_map.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_world_map.intro')}</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-muted-foreground">{t('admin_world_map.located_users')}</p>
                        <p className="mt-3 text-3xl font-semibold">{summary.total_located_users}</p>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-muted-foreground">{t('admin_world_map.countries')}</p>
                        <p className="mt-3 text-3xl font-semibold">{summary.countries_represented}</p>
                    </article>
                    <TopCountryCard title={t('admin_world_map.top_country_by_users')} country={summary.top_country_by_users} valueKey="users_count" />
                    <TopCountryCard title={t('admin_world_map.top_country_by_teachers')} country={summary.top_country_by_teachers} valueKey="teachers_count" />
                    <TopCountryCard title={t('admin_world_map.top_country_by_students')} country={summary.top_country_by_students} valueKey="students_count" />
                </section>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {countries.map((country) => {
                        return (
                            <article key={country.country_code} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Globe2 className="size-5 text-emerald-700 dark:text-emerald-300" />
                                        <div>
                                            <h2 className="text-lg font-semibold">{country.country_code}</h2>
                                            <p className="text-sm text-muted-foreground">{t('admin_world_map.country_share', { percent: country.percentage })}</p>
                                        </div>
                                    </div>
                                    <p className="text-3xl font-semibold">{country.users_count}</p>
                                </div>
                                <div className="mt-4 grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('admin_world_map.teachers')}</span>
                                        <span>{country.teachers_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('admin_world_map.students')}</span>
                                        <span>{country.students_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('admin_world_map.mixed_users')}</span>
                                        <span>{country.mixed_users_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('admin_world_map.published_offers')}</span>
                                        <span>{country.published_offers_count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{t('admin_world_map.pending_applications')}</span>
                                        <span>{country.pending_applications_count}</span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                    {countries.length === 0 && (
                        <article className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {t('admin_world_map.empty')}
                        </article>
                    )}
                </section>

                <ContextualHelp title={t('admin_world_map.help_title')}>
                    {t('admin_world_map.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function TopCountryCard({
    title,
    country,
    valueKey,
}: {
    title: string;
    country: Country | null;
    valueKey: 'users_count' | 'teachers_count' | 'students_count';
}) {
    const { t } = useTranslation();

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">{title}</p>
            {country ? (
                <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-3xl font-semibold">{country.country_code}</p>
                    <p className="text-sm text-muted-foreground">{country[valueKey]}</p>
                </div>
            ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t('admin_world_map.empty')}</p>
            )}
        </article>
    );
}

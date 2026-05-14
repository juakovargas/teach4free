import { Head } from '@inertiajs/react';
import { BookOpenCheck, Circle, Globe2, GraduationCap, Map, MapPin, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

import { WorldActivityMap, valueForMode } from '@/components/admin/world-activity-map';
import type { MapMode, WorldMapCountry } from '@/components/admin/world-activity-map';
import { ContextualHelp } from '@/components/contextual-help';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Country = WorldMapCountry;

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
    const [mode, setMode] = useState<MapMode>('all_users');
    const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(countries[0]?.country_code ?? null);
    const selectedCountry = useMemo(() => {
        const activeSelectedCountry = countries.find(
            (country) => country.country_code === selectedCountryCode && valueForMode(country, mode) > 0,
        );

        return activeSelectedCountry ?? countries.find((country) => valueForMode(country, mode) > 0) ?? countries[0] ?? null;
    }, [countries, mode, selectedCountryCode]);
    const activeModeTotal = countries.reduce((total, country) => total + valueForMode(country, mode), 0);

    const modes = [
        { value: 'all_users' as const, label: t('admin_world_map.all_users'), icon: Users },
        { value: 'teachers' as const, label: t('admin_world_map.teachers'), icon: GraduationCap },
        { value: 'students' as const, label: t('admin_world_map.students'), icon: BookOpenCheck },
        { value: 'offers' as const, label: t('admin_world_map.teaching_offers'), icon: MapPin },
    ];

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

                <section className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,0.85fr)]">
                    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">{t('admin_world_map.world_activity_map')}</h2>
                                <p className="mt-1 text-sm text-muted-foreground">{t('admin_world_map.map_privacy_note')}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-medium uppercase text-muted-foreground">{t('admin_world_map.view_mode')}</p>
                                <div className="grid grid-cols-2 gap-2 sm:flex">
                                    {modes.map((item) => {
                                        const Icon = item.icon;

                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                className={cn(
                                                    'inline-flex min-h-9 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors',
                                                    mode === item.value
                                                        ? 'border-emerald-700 bg-emerald-700 text-white dark:border-emerald-300 dark:bg-emerald-300 dark:text-slate-950'
                                                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300',
                                                )}
                                                onClick={() => setMode(item.value)}
                                            >
                                                <Icon className="size-4" />
                                                <span>{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <WorldActivityMap
                                countries={countries}
                                mode={mode}
                                selectedCountry={selectedCountry}
                                onSelectCountry={(country) => setSelectedCountryCode(country.country_code)}
                                labels={{
                                    users: t('admin_world_map.users'),
                                    teachers: t('admin_world_map.teachers'),
                                    students: t('admin_world_map.students'),
                                    offers: t('admin_world_map.offers'),
                                    empty: t('admin_world_map.no_located_users_yet'),
                                    mapAria: t('admin_world_map.world_activity_map'),
                                }}
                            />
                        </div>
                    </article>

                    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('admin_world_map.marker_legend')}</p>
                                <div className="mt-3 flex items-end gap-2" aria-hidden="true">
                                    <Circle className="size-3 fill-emerald-600 text-emerald-600 dark:fill-emerald-300 dark:text-emerald-300" />
                                    <Circle className="size-5 fill-emerald-600 text-emerald-600 dark:fill-emerald-300 dark:text-emerald-300" />
                                    <Circle className="size-8 fill-emerald-600 text-emerald-600 dark:fill-emerald-300 dark:text-emerald-300" />
                                </div>
                                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t('admin_world_map.marker_legend_body')}</p>
                                <div className="mt-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                                    <p className="text-xs font-medium uppercase text-muted-foreground">{t('admin_world_map.selected_metric')}</p>
                                    <p className="mt-1 text-2xl font-semibold">{activeModeTotal}</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-5 dark:border-slate-800">
                                <p className="text-sm font-medium text-muted-foreground">{t('admin_world_map.selected_country')}</p>
                                {selectedCountry ? (
                                    <div className="mt-3 space-y-4">
                                        <div>
                                            <h3 className="text-xl font-semibold">{selectedCountry.country_name}</h3>
                                            <p className="text-xs text-muted-foreground">{selectedCountry.country_code}</p>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <MetricRow label={t('admin_world_map.users')} value={selectedCountry.total_users} />
                                            <MetricRow label={t('admin_world_map.teachers')} value={selectedCountry.teachers_count} />
                                            <MetricRow label={t('admin_world_map.students')} value={selectedCountry.students_count} />
                                            <MetricRow label={t('admin_world_map.mixed_users')} value={selectedCountry.mixed_users_count} />
                                            <MetricRow label={t('admin_world_map.offers')} value={selectedCountry.offers_count} />
                                            <MetricRow label={t('admin_world_map.pending_applications')} value={selectedCountry.pending_applications_count} />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-muted-foreground">{t('admin_world_map.no_located_users_yet')}</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-muted-foreground">{t('admin_world_map.located_users')}</p>
                        <p className="mt-3 text-3xl font-semibold">{summary.total_located_users}</p>
                    </article>
                    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm text-muted-foreground">{t('admin_world_map.countries_represented')}</p>
                        <p className="mt-3 text-3xl font-semibold">{summary.countries_represented}</p>
                    </article>
                    <TopCountryCard title={t('admin_world_map.top_country_by_users')} country={summary.top_country_by_users} valueKey="total_users" />
                    <TopCountryCard title={t('admin_world_map.top_country_by_teachers')} country={summary.top_country_by_teachers} valueKey="teachers_count" />
                    <TopCountryCard title={t('admin_world_map.top_country_by_students')} country={summary.top_country_by_students} valueKey="students_count" />
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">{t('admin_world_map.country_statistics')}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t('admin_world_map.country_statistics_intro')}</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {countries.map((country) => {
                            return (
                                <article key={country.country_code} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Globe2 className="size-5 text-emerald-700 dark:text-emerald-300" />
                                            <div>
                                                <h3 className="text-lg font-semibold">{country.country_name}</h3>
                                                <p className="text-xs text-muted-foreground">{country.country_code}</p>
                                                <p className="text-sm text-muted-foreground">{t('admin_world_map.country_share', { percent: country.percentage })}</p>
                                            </div>
                                        </div>
                                        <p className="text-3xl font-semibold">{country.total_users}</p>
                                    </div>
                                    <div className="mt-4 grid gap-2 text-sm">
                                        <MetricRow label={t('admin_world_map.teachers')} value={country.teachers_count} />
                                        <MetricRow label={t('admin_world_map.students')} value={country.students_count} />
                                        <MetricRow label={t('admin_world_map.mixed_users')} value={country.mixed_users_count} />
                                        <MetricRow label={t('admin_world_map.published_offers')} value={country.published_offers_count} />
                                        <MetricRow label={t('admin_world_map.pending_applications')} value={country.pending_applications_count} />
                                    </div>
                                </article>
                            );
                        })}
                        {countries.length === 0 && (
                            <article className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                                {t('admin_world_map.empty')}
                            </article>
                        )}
                    </div>
                </section>

                <ContextualHelp title={t('admin_world_map.help_title')}>
                    {t('admin_world_map.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function MetricRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span>{value}</span>
        </div>
    );
}

function TopCountryCard({
    title,
    country,
    valueKey,
}: {
    title: string;
    country: Country | null;
    valueKey: 'total_users' | 'teachers_count' | 'students_count';
}) {
    const { t } = useTranslation();

    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">{title}</p>
            {country ? (
                <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                        <p className="text-xl font-semibold">{country.country_name}</p>
                        <p className="text-xs text-muted-foreground">{country.country_code}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{country[valueKey]}</p>
                </div>
            ) : (
                <p className="mt-3 text-sm text-muted-foreground">{t('admin_world_map.empty')}</p>
            )}
        </article>
    );
}

import { geoEqualEarth, geoPath } from 'd3-geo';
import type { FeatureCollection, Geometry } from 'geojson';
import { useMemo } from 'react';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import worldAtlas from 'world-atlas/countries-110m.json';

import { cn } from '@/lib/utils';

export type MapMode = 'all_users' | 'teachers' | 'students' | 'offers';

export type WorldMapCountry = {
    country_code: string;
    country_name: string;
    latitude: number | null;
    longitude: number | null;
    total_users: number;
    users_count: number;
    teachers_count: number;
    students_count: number;
    mixed_users_count: number;
    offers_count: number;
    published_offers_count: number;
    pending_applications_count: number;
    percentage: number;
};

type Props = {
    countries: WorldMapCountry[];
    mode: MapMode;
    selectedCountry: WorldMapCountry | null;
    onSelectCountry: (country: WorldMapCountry) => void;
    labels: {
        users: string;
        teachers: string;
        students: string;
        offers: string;
        empty: string;
        mapAria: string;
    };
};

type CountryProperties = {
    name?: string;
};

type WorldTopology = Topology<{
    countries: GeometryCollection<CountryProperties>;
}>;

const WIDTH = 960;
const HEIGHT = 460;
const worldTopology = worldAtlas as unknown as WorldTopology;
const worldFeatures = feature<CountryProperties>(
    worldTopology,
    worldTopology.objects.countries,
) as FeatureCollection<Geometry, CountryProperties>;

export function WorldActivityMap({
    countries,
    mode,
    selectedCountry,
    onSelectCountry,
    labels,
}: Props) {
    const projection = useMemo(() => {
        return geoEqualEarth().fitExtent(
            [
                [16, 18],
                [WIDTH - 16, HEIGHT - 18],
            ],
            worldFeatures,
        );
    }, []);

    const path = useMemo(() => geoPath(projection), [projection]);
    const activeCountries = countries.filter((country) => valueForMode(country, mode) > 0 && country.latitude !== null && country.longitude !== null);
    const maxValue = Math.max(...activeCountries.map((country) => valueForMode(country, mode)), 0);

    return (
        <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-sky-50/60 dark:border-slate-800 dark:bg-slate-950">
            <svg
                aria-label={labels.mapAria}
                className="h-auto w-full"
                role="img"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            >
                <rect width={WIDTH} height={HEIGHT} className="fill-sky-50 dark:fill-slate-950" />
                <g>
                    {worldFeatures.features.map((countryFeature, index) => {
                        const pathValue = path(countryFeature);

                        if (!pathValue) {
                            return null;
                        }

                        return (
                            <path
                                key={`${countryFeature.properties?.name ?? 'country'}-${index}`}
                                d={pathValue}
                                className="fill-slate-200 stroke-white stroke-[0.7] transition-colors dark:fill-slate-800 dark:stroke-slate-900"
                            />
                        );
                    })}
                </g>
                <g>
                    {activeCountries.map((country) => {
                        const coordinates = projection([country.longitude as number, country.latitude as number]);

                        if (!coordinates) {
                            return null;
                        }

                        const [x, y] = coordinates;
                        const value = valueForMode(country, mode);
                        const radius = markerRadius(value, maxValue);
                        const isSelected = selectedCountry?.country_code === country.country_code;

                        return (
                            <g key={country.country_code}>
                                <title>{tooltipText(country, labels)}</title>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={radius + 5}
                                    className={cn(
                                        'fill-emerald-500/15 transition-all duration-200',
                                        isSelected && 'fill-emerald-400/25',
                                    )}
                                />
                                <circle
                                    aria-label={`${country.country_name}: ${value}`}
                                    cx={x}
                                    cy={y}
                                    r={radius}
                                    role="button"
                                    tabIndex={0}
                                    className={cn(
                                        'cursor-pointer fill-emerald-600/80 stroke-white stroke-2 transition-all duration-200 hover:fill-emerald-500 focus:outline-none focus-visible:stroke-emerald-950 dark:fill-emerald-400/85 dark:stroke-slate-950',
                                        isSelected && 'fill-teal-500 stroke-emerald-950 dark:fill-teal-300',
                                    )}
                                    onClick={() => onSelectCountry(country)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            onSelectCountry(country);
                                        }
                                    }}
                                />
                            </g>
                        );
                    })}
                </g>
            </svg>

            {countries.length === 0 && (
                <div className="absolute inset-x-4 bottom-4 rounded-lg border border-dashed border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200">
                    {labels.empty}
                </div>
            )}
        </div>
    );
}

export function valueForMode(country: WorldMapCountry, mode: MapMode): number {
    if (mode === 'teachers') {
        return country.teachers_count;
    }

    if (mode === 'students') {
        return country.students_count;
    }

    if (mode === 'offers') {
        return country.offers_count;
    }

    return country.total_users;
}

function markerRadius(value: number, maxValue: number): number {
    if (value <= 0 || maxValue <= 0) {
        return 0;
    }

    return 5 + Math.sqrt(value / maxValue) * 19;
}

function tooltipText(country: WorldMapCountry, labels: Props['labels']): string {
    return [
        country.country_name,
        `${labels.users}: ${country.total_users}`,
        `${labels.teachers}: ${country.teachers_count}`,
        `${labels.students}: ${country.students_count}`,
        `${labels.offers}: ${country.offers_count}`,
    ].join('\n');
}

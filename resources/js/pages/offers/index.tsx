import { Head, router } from '@inertiajs/react';
import { FilterX, Search, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { EmptyState, OfferCard } from '@/components/public/public-identity';
import type { PublicOffer } from '@/components/public/public-identity';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';

type Category = {
    id: number;
    name: string;
    slug: string;
    color: string | null;
};

type Subject = {
    id: number;
    teaching_category_id: number;
    name: string;
    slug: string;
};

type Language = {
    id: number;
    code: string;
    name: string;
    native_name: string;
};

type Offer = {
    id: number;
    slug: string;
    title: string;
    summary: string;
    level: string;
    teaching_mode: string;
    session_type: string;
    duration_minutes: number;
    availability_summary: string | null;
    is_accepting_applications: boolean;
    user: {
        id: number;
        name: string;
        avatar?: string | null;
        city?: string | null;
        country_code?: string | null;
        profile_url?: string | null;
    };
    category: Category;
    subject: { name: string; slug: string } | null;
    languages: Language[];
};

type Filters = {
    search: string;
    category: string;
    subject: string;
    language: string;
    level: string;
    teaching_mode: string;
    session_type: string;
    availability: string;
    teacher: string;
    accepting: boolean;
};

type Props = {
    offers: Offer[];
    filters: Filters;
    categories: Category[];
    subjects: Subject[];
    languages: Language[];
    levels: string[];
    teachingModes: string[];
    sessionTypes: string[];
    filteredTeacher: { id: number; name: string } | null;
};

export default function PublicOffers({
    offers,
    filters,
    categories,
    subjects,
    languages,
    levels,
    teachingModes,
    sessionTypes,
    filteredTeacher,
}: Props) {
    const { t } = useTranslation();
    const [data, setData] = useState<Filters>(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/offers', data, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const reset = () => {
        router.get('/offers');
    };

    return (
        <>
            <Head title={t('offers.meta_title')} />
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30rem),linear-gradient(180deg,#fffaf3_0%,#ffffff_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28rem),linear-gradient(180deg,#07140f_0%,#020617_55%)]">
                <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                    <section className="rounded-lg border border-white/80 bg-white/75 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                                    <Search className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{t('offers.eyebrow')}</p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('offers.title')}</h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{t('offers.intro')}</p>
                                </div>
                            </div>
                            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                                {t('offers.result_count', { count: offers.length })}
                            </div>
                        </div>
                    </section>

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
                    {filteredTeacher && (
                        <div className="md:col-span-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
                                {t('offers.teacher_filter_active', { teacher: filteredTeacher.name })}
                                <button
                                    type="button"
                                    className="rounded-full p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                                    onClick={() => {
                                        const nextFilters = { ...data, teacher: '' };

                                        setData(nextFilters);
                                        router.get('/offers', nextFilters, {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        });
                                    }}
                                    aria-label={t('offers.clear_teacher_filter')}
                                >
                                    <FilterX className="size-4" />
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="search">{t('offers.search')}</Label>
                        <Input id="search" value={data.search} onChange={(event) => setData({ ...data, search: event.target.value })} />
                    </div>
                    <FilterSelect label={t('offers.category')} value={data.category} onChange={(value) => setData({ ...data, category: value === 'all' ? '' : value, subject: '' })} allLabel={t('offers.all_categories')} options={categories.map((category) => [category.slug, category.name])} />
                    <FilterSelect label={t('offers.subject')} value={data.subject} onChange={(value) => setData({ ...data, subject: value === 'all' ? '' : value })} allLabel={t('offers.all_subjects')} options={subjects.filter((subject) => !data.category || subject.teaching_category_id === categories.find((category) => category.slug === data.category)?.id).map((subject) => [subject.slug, subject.name])} />
                    <FilterSelect label={t('offers.language')} value={data.language} onChange={(value) => setData({ ...data, language: value === 'all' ? '' : value })} allLabel={t('offers.all_languages')} options={languages.map((language) => [language.code, language.name])} />
                    <FilterSelect label={t('offers.level')} value={data.level} onChange={(value) => setData({ ...data, level: value === 'all' ? '' : value })} allLabel={t('offers.all_levels')} options={levels.map((level) => [level, t(`offer_levels.${level}`)])} />
                    <FilterSelect label={t('offers.mode')} value={data.teaching_mode} onChange={(value) => setData({ ...data, teaching_mode: value === 'all' ? '' : value })} allLabel={t('offers.all_modes')} options={teachingModes.map((mode) => [mode, t(`learning_modes.${mode}`)])} />
                    <FilterSelect label={t('offers.session_type')} value={data.session_type} onChange={(value) => setData({ ...data, session_type: value === 'all' ? '' : value })} allLabel={t('offers.all_session_types')} options={sessionTypes.map((type) => [type, t(`session_types.${type}`)])} />
                    <div className="space-y-2">
                        <Label htmlFor="availability">{t('offers.availability')}</Label>
                        <Input id="availability" value={data.availability} onChange={(event) => setData({ ...data, availability: event.target.value })} />
                    </div>
                    <label className="flex items-center gap-2 pt-8 text-sm font-medium">
                        <Checkbox checked={data.accepting} onCheckedChange={(checked) => setData({ ...data, accepting: checked === true })} />
                        {t('offers.only_accepting')}
                    </label>
                    <div className="flex items-end gap-2 md:col-span-3">
                        <Button>
                            <Search />
                            {t('offers.apply_filters')}
                        </Button>
                        <Button type="button" variant="outline" onClick={reset}>
                            <FilterX />
                            {t('offers.reset_filters')}
                        </Button>
                    </div>
                </form>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {offers.length === 0 && (
                        <div className="md:col-span-2 xl:col-span-3">
                            <EmptyState title={t('offers.no_results_title')} icon={Sparkles}>
                                {t('offers.no_results')}
                            </EmptyState>
                        </div>
                    )}
                    {offers.map((offer) => (
                        <OfferCard key={offer.id} offer={toPublicOffer(offer)} />
                    ))}
                </section>

                </div>
            </div>
        </>
    );
}

function toPublicOffer(offer: Offer): PublicOffer {
    return {
        ...offer,
        teacher: {
            id: offer.user.id,
            name: offer.user.name,
            avatar: offer.user.avatar ?? null,
            city: offer.user.city ?? null,
            country_code: offer.user.country_code ?? null,
            profile_url: offer.user.profile_url,
        },
        url: `/offers/${offer.slug}`,
    };
}

function FilterSelect({
    label,
    value,
    onChange,
    allLabel,
    options,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    allLabel: string;
    options: string[][];
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value || 'all'} onValueChange={onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{allLabel}</SelectItem>
                    {options.map(([optionValue, optionLabel]) => (
                        <SelectItem key={optionValue} value={optionValue}>{optionLabel}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

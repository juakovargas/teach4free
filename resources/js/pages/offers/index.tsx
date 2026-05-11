import { Head, Link, router } from '@inertiajs/react';
import { Clock, Search, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
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
    user: { name: string; avatar?: string | null };
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
}: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
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
            <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Search className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-3xl font-semibold tracking-normal">{t('offers.title')}</h1>
                            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{t('offers.intro')}</p>
                        </div>
                    </div>
                </section>

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
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
                            {t('offers.reset_filters')}
                        </Button>
                    </div>
                </form>

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {offers.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-muted-foreground dark:border-slate-800 dark:bg-slate-900 md:col-span-2 xl:col-span-3">
                            {t('offers.no_results')}
                        </div>
                    )}
                    {offers.map((offer) => (
                        <article key={offer.id} className="flex min-h-80 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-4 flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarImage src={offer.user.avatar ?? undefined} alt={offer.user.name} />
                                    <AvatarFallback>{getInitials(offer.user.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{offer.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{offer.category.name}</p>
                                </div>
                            </div>
                            <h2 className="text-lg font-semibold">{offer.title}</h2>
                            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{offer.summary}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="outline">{t(`offer_levels.${offer.level}`)}</Badge>
                                <Badge variant="outline">{t(`learning_modes.${offer.teaching_mode}`)}</Badge>
                                <Badge variant="outline">{t(`session_types.${offer.session_type}`)}</Badge>
                                {offer.languages.map((language) => (
                                    <Badge key={language.code} variant="secondary">{language.name}</Badge>
                                ))}
                            </div>
                            <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <Clock className="size-4" />
                                    {t('offers.duration_value', { minutes: offer.duration_minutes })}
                                </span>
                                {offer.availability_summary && (
                                    <span className="flex items-center gap-2">
                                        <Users className="size-4" />
                                        {offer.availability_summary}
                                    </span>
                                )}
                            </div>
                            <Button className="mt-5 w-fit" asChild>
                                <Link href={`/offers/${offer.slug}`}>{t('offers.view_details')}</Link>
                            </Button>
                        </article>
                    ))}
                </section>

                <ContextualHelp title={t('offers.help_title')}>
                    {t('offers.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
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

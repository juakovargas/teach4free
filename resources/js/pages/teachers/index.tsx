import { Head, Link, router } from '@inertiajs/react';
import { FilterX, GraduationCap, MapPin, Search, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import {
    EmptyState,
    TeacherCard,
} from '@/components/public/public-identity';
import type {
    PublicLanguage,
    PublicTeacher,
} from '@/components/public/public-identity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

type Filters = {
    search: string;
    language: string;
    category: string;
    subject: string;
    country: string;
    availability: string;
    sort: string;
};

type Props = {
    teachers: PublicTeacher[];
    filters: Filters;
    categories: Category[];
    subjects: Subject[];
    languages: PublicLanguage[];
    countries: string[];
};

export default function TeachersIndex({
    teachers,
    filters,
    categories,
    subjects,
    languages,
    countries,
}: Props) {
    const { t } = useTranslation();
    const [data, setData] = useState<Filters>(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/teachers', data, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const reset = () => router.get('/teachers');

    const visibleSubjects = subjects.filter(
        (subject) =>
            !data.category ||
            subject.teaching_category_id ===
                categories.find((category) => category.slug === data.category)?.id,
    );

    return (
        <>
            <Head title={t('teachers.meta_title')} />
            <div className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_30rem),linear-gradient(180deg,#fffaf3_0%,#ffffff_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28rem),linear-gradient(180deg,#07140f_0%,#020617_55%)]">
                <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                    <section className="rounded-lg border border-white/80 bg-white/75 p-6 shadow-xl shadow-emerald-950/5 backdrop-blur dark:border-white/10 dark:bg-white/10">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                                    <GraduationCap className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                                        {t('teachers.eyebrow')}
                                    </p>
                                    <h1 className="mt-2 text-3xl font-semibold tracking-normal">
                                        {t('teachers.title')}
                                    </h1>
                                    <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
                                        {t('teachers.intro')}
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                                {t('teachers.result_count', {
                                    count: teachers.length,
                                })}
                            </div>
                        </div>
                    </section>

                    <form
                        onSubmit={submit}
                        className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="search">
                                {t('teachers.search')}
                            </Label>
                            <Input
                                id="search"
                                value={data.search}
                                onChange={(event) =>
                                    setData({ ...data, search: event.target.value })
                                }
                            />
                        </div>
                        <FilterSelect
                            label={t('teachers.language')}
                            value={data.language}
                            onChange={(value) =>
                                setData({
                                    ...data,
                                    language: value === 'all' ? '' : value,
                                })
                            }
                            allLabel={t('teachers.all_languages')}
                            options={languages.map((language) => [
                                language.code,
                                language.name,
                            ])}
                        />
                        <FilterSelect
                            label={t('teachers.country')}
                            value={data.country}
                            onChange={(value) =>
                                setData({
                                    ...data,
                                    country: value === 'all' ? '' : value,
                                })
                            }
                            allLabel={t('teachers.all_countries')}
                            options={countries.map((country) => [country, country])}
                        />
                        <FilterSelect
                            label={t('teachers.category')}
                            value={data.category}
                            onChange={(value) =>
                                setData({
                                    ...data,
                                    category: value === 'all' ? '' : value,
                                    subject: '',
                                })
                            }
                            allLabel={t('teachers.all_categories')}
                            options={categories.map((category) => [
                                category.slug,
                                category.name,
                            ])}
                        />
                        <FilterSelect
                            label={t('teachers.subject')}
                            value={data.subject}
                            onChange={(value) =>
                                setData({
                                    ...data,
                                    subject: value === 'all' ? '' : value,
                                })
                            }
                            allLabel={t('teachers.all_subjects')}
                            options={visibleSubjects.map((subject) => [
                                subject.slug,
                                subject.name,
                            ])}
                        />
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="availability">
                                {t('teachers.availability')}
                            </Label>
                            <Input
                                id="availability"
                                value={data.availability}
                                onChange={(event) =>
                                    setData({
                                        ...data,
                                        availability: event.target.value,
                                    })
                                }
                            />
                        </div>
                        <FilterSelect
                            label={t('teachers.sort')}
                            value={data.sort}
                            onChange={(value) =>
                                setData({
                                    ...data,
                                    sort: value === 'all' ? '' : value,
                                })
                            }
                            allLabel={t('teacher_sorts.featured')}
                            options={[
                                ['highest_rated', t('teacher_sorts.highest_rated')],
                                ['most_reviewed', t('teacher_sorts.most_reviewed')],
                                ['most_sessions', t('teacher_sorts.most_sessions')],
                                ['new_teachers', t('teacher_sorts.new_teachers')],
                            ]}
                        />
                        <div className="flex items-end gap-2 md:col-span-4">
                            <Button>
                                <Search />
                                {t('teachers.apply_filters')}
                            </Button>
                            <Button type="button" variant="outline" onClick={reset}>
                                <FilterX />
                                {t('teachers.reset_filters')}
                            </Button>
                        </div>
                    </form>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {teachers.length === 0 && (
                            <div className="md:col-span-2 xl:col-span-3">
                                <EmptyState
                                    title={t('teachers.empty_title')}
                                    icon={Sparkles}
                                >
                                    {t('teachers.empty_body')}
                                </EmptyState>
                            </div>
                        )}
                        {teachers.map((teacher) => (
                            <TeacherCard key={teacher.id} teacher={teacher} />
                        ))}
                    </section>

                    <section className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="font-semibold text-slate-950 dark:text-white">
                                    {t('teachers.language_discovery_title')}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    {t('teachers.language_discovery_body')}
                                </p>
                            </div>
                            <Button variant="outline" asChild>
                                <Link href="/offers">
                                    <MapPin />
                                    {t('teachers.view_all_offers')}
                                </Link>
                            </Button>
                        </div>
                    </section>
                </div>
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
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{allLabel}</SelectItem>
                    {options.map(([optionValue, optionLabel]) => (
                        <SelectItem key={optionValue} value={optionValue}>
                            {optionLabel}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

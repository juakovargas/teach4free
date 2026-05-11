import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { useMemo } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Language = {
    id: number;
    code: string;
    name: string;
    native_name: string;
};

type Subject = {
    id: number;
    teaching_category_id: number;
    name: string;
    slug: string;
};

type Category = {
    id: number;
    name: string;
    slug: string;
    subjects: Subject[];
};

type Offer = {
    id: number;
    slug: string;
    teaching_category_id: number;
    teaching_subject_id: number | null;
    title: string;
    summary: string;
    description: string;
    level: string;
    teaching_mode: string;
    session_type: string;
    max_students: number | null;
    duration_minutes: number;
    meeting_tool: string;
    meeting_url: string | null;
    timezone: string;
    availability_summary: string | null;
    requirements: string | null;
    materials_summary: string | null;
    is_public: boolean;
    is_active: boolean;
    is_accepting_applications: boolean;
    allow_waiting_list: boolean;
    waiting_list_limit: number | null;
    languages: Language[];
};

type Props = {
    offer: Offer | null;
    categories: Category[];
    languages: Language[];
    levels: string[];
    teachingModes: string[];
    sessionTypes: string[];
    meetingTools: string[];
};

type OfferForm = {
    title: string;
    teaching_category_id: number | null;
    teaching_subject_id: number | null;
    summary: string;
    description: string;
    level: string;
    teaching_mode: string;
    session_type: string;
    max_students: number | null;
    duration_minutes: number;
    meeting_tool: string;
    meeting_url: string;
    timezone: string;
    availability_summary: string;
    requirements: string;
    materials_summary: string;
    is_public: boolean;
    is_active: boolean;
    is_accepting_applications: boolean;
    allow_waiting_list: boolean;
    waiting_list_limit: number | null;
    language_ids: number[];
};

export default function TeacherOfferForm({
    offer,
    categories,
    languages,
    levels,
    teachingModes,
    sessionTypes,
    meetingTools,
}: Props) {
    const { t } = useTranslation();
    const isEditing = offer !== null;
    const firstCategory = categories[0]?.id ?? null;
    const { data, setData, post, put, processing, errors } = useForm<OfferForm>({
        title: offer?.title ?? '',
        teaching_category_id: offer?.teaching_category_id ?? firstCategory,
        teaching_subject_id: offer?.teaching_subject_id ?? null,
        summary: offer?.summary ?? '',
        description: offer?.description ?? '',
        level: offer?.level ?? 'beginner',
        teaching_mode: offer?.teaching_mode ?? 'small_group',
        session_type: offer?.session_type ?? 'scheduled_group',
        max_students: offer?.max_students ?? 5,
        duration_minutes: offer?.duration_minutes ?? 60,
        meeting_tool: offer?.meeting_tool ?? 'not_decided',
        meeting_url: offer?.meeting_url ?? '',
        timezone: offer?.timezone ?? 'Europe/Madrid',
        availability_summary: offer?.availability_summary ?? '',
        requirements: offer?.requirements ?? '',
        materials_summary: offer?.materials_summary ?? '',
        is_public: offer?.is_public ?? true,
        is_active: offer?.is_active ?? true,
        is_accepting_applications: offer?.is_accepting_applications ?? true,
        allow_waiting_list: offer?.allow_waiting_list ?? true,
        waiting_list_limit: offer?.waiting_list_limit ?? null,
        language_ids: offer?.languages.map((language) => language.id) ?? languages.map((language) => language.id).slice(0, 1),
    });

    const availableSubjects = useMemo(
        () => categories.find((category) => category.id === data.teaching_category_id)?.subjects ?? [],
        [categories, data.teaching_category_id],
    );

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isEditing) {
            put(`/teacher/offers/${offer.slug}`);

            return;
        }

        post('/teacher/offers');
    };

    const toggleLanguage = (languageId: number, checked: boolean) => {
        setData(
            'language_ids',
            checked
                ? [...data.language_ids, languageId]
                : data.language_ids.filter((id) => id !== languageId),
        );
    };

    return (
        <>
            <Head title={isEditing ? t('teacher_offers.edit_title') : t('teacher_offers.create_title')} />
            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <FileText className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {isEditing ? t('teacher_offers.edit_title') : t('teacher_offers.create_title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('teacher_offers.form_intro')}</p>
                        </div>
                    </div>
                </section>

                {languages.length === 0 && (
                    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                        <p className="font-semibold">{t('teacher_offers.no_teaching_languages_title')}</p>
                        <p className="mt-2">{t('teacher_offers.no_teaching_languages_body')}</p>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/profile/preferences">{t('teacher_offers.edit_languages_link')}</Link>
                        </Button>
                    </section>
                )}

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="title">{t('teacher_offers.field_title')}</Label>
                        <Input id="title" value={data.title} onChange={(event) => setData('title', event.target.value)} />
                        <InputError message={errors.title} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">{t('teacher_offers.category')}</Label>
                        <Select
                            value={data.teaching_category_id ? String(data.teaching_category_id) : ''}
                            onValueChange={(value) => {
                                setData('teaching_category_id', Number(value));
                                setData('teaching_subject_id', null);
                            }}
                        >
                            <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.teaching_category_id} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">{t('teacher_offers.subject')}</Label>
                        <Select
                            value={data.teaching_subject_id ? String(data.teaching_subject_id) : 'none'}
                            onValueChange={(value) => setData('teaching_subject_id', value === 'none' ? null : Number(value))}
                        >
                            <SelectTrigger id="subject"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t('common.none')}</SelectItem>
                                {availableSubjects.map((subject) => (
                                    <SelectItem key={subject.id} value={String(subject.id)}>{subject.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.teaching_subject_id} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="summary">{t('teacher_offers.summary')}</Label>
                        <Textarea id="summary" value={data.summary} onChange={(event) => setData('summary', event.target.value)} />
                        <InputError message={errors.summary} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">{t('teacher_offers.description')}</Label>
                        <Textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        <InputError message={errors.description} />
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
                    <SelectField label={t('teacher_offers.level')} value={data.level} onChange={(value) => setData('level', value)} options={levels.map((level) => [level, t(`offer_levels.${level}`)])} error={errors.level} />
                    <SelectField label={t('teacher_offers.mode')} value={data.teaching_mode} onChange={(value) => setData('teaching_mode', value)} options={teachingModes.map((mode) => [mode, t(`learning_modes.${mode}`)])} error={errors.teaching_mode} />
                    <SelectField label={t('teacher_offers.session_type')} value={data.session_type} onChange={(value) => setData('session_type', value)} options={sessionTypes.map((type) => [type, t(`session_types.${type}`)])} error={errors.session_type} />
                    <div className="space-y-2">
                        <Label htmlFor="max_students">{t('teacher_offers.max_students')}</Label>
                        <Input id="max_students" type="number" min="1" max="500" value={data.max_students ?? ''} onChange={(event) => setData('max_students', event.target.value ? Number(event.target.value) : null)} />
                        <InputError message={errors.max_students} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">{t('teacher_offers.duration')}</Label>
                        <Input id="duration" type="number" min="15" max="240" value={data.duration_minutes} onChange={(event) => setData('duration_minutes', Number(event.target.value))} />
                        <InputError message={errors.duration_minutes} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timezone">{t('teacher_offers.timezone')}</Label>
                        <Input id="timezone" value={data.timezone} onChange={(event) => setData('timezone', event.target.value)} />
                        <InputError message={errors.timezone} />
                    </div>
                    <SelectField label={t('teacher_offers.meeting_tool')} value={data.meeting_tool} onChange={(value) => setData('meeting_tool', value)} options={meetingTools.map((tool) => [tool, t(`meeting_tools.${tool}`)])} error={errors.meeting_tool} />
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="meeting_url">{t('teacher_offers.meeting_url')}</Label>
                        <Input id="meeting_url" value={data.meeting_url} onChange={(event) => setData('meeting_url', event.target.value)} />
                        <InputError message={errors.meeting_url} />
                    </div>
                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-muted-foreground md:col-span-3 dark:bg-slate-950">
                        {t('teacher_offers.external_meeting_note')}
                    </p>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2 md:col-span-2">
                        <Label>{t('teacher_offers.languages')}</Label>
                        <div className="flex flex-wrap gap-3">
                            {languages.map((language) => (
                                <label key={language.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
                                    <Checkbox checked={data.language_ids.includes(language.id)} onCheckedChange={(checked) => toggleLanguage(language.id, checked === true)} />
                                    <span>{language.name}</span>
                                </label>
                            ))}
                        </div>
                        <InputError message={errors.language_ids} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="availability_summary">{t('teacher_offers.availability_summary')}</Label>
                        <Textarea id="availability_summary" value={data.availability_summary} onChange={(event) => setData('availability_summary', event.target.value)} />
                        <InputError message={errors.availability_summary} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="requirements">{t('teacher_offers.requirements')}</Label>
                        <Textarea id="requirements" value={data.requirements} onChange={(event) => setData('requirements', event.target.value)} />
                        <InputError message={errors.requirements} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="materials_summary">{t('teacher_offers.materials_summary')}</Label>
                        <Textarea id="materials_summary" value={data.materials_summary} onChange={(event) => setData('materials_summary', event.target.value)} />
                        <InputError message={errors.materials_summary} />
                    </div>
                    <div className="flex flex-wrap gap-4 md:col-span-2">
                        <Toggle checked={data.is_public} onChange={(checked) => setData('is_public', checked)} label={t('teacher_offers.is_public')} />
                        <Toggle checked={data.is_active} onChange={(checked) => setData('is_active', checked)} label={t('teacher_offers.is_active')} />
                        <Toggle checked={data.is_accepting_applications} onChange={(checked) => setData('is_accepting_applications', checked)} label={t('teacher_offers.accepting_applications')} />
                        <Toggle checked={data.allow_waiting_list} onChange={(checked) => setData('allow_waiting_list', checked)} label={t('teacher_offers.allow_waiting_list')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="waiting_list_limit">{t('teacher_offers.waiting_list_limit')}</Label>
                        <Input id="waiting_list_limit" type="number" min="1" max="500" value={data.waiting_list_limit ?? ''} onChange={(event) => setData('waiting_list_limit', event.target.value ? Number(event.target.value) : null)} />
                        <InputError message={errors.waiting_list_limit} />
                    </div>
                </section>

                <ContextualHelp title={t('teacher_offers.help_title')}>
                    {t('teacher_offers.help_body')}
                </ContextualHelp>

                <div className="flex gap-3">
                    <Button disabled={processing || languages.length === 0}>
                        <Save />
                        {t('actions.save')}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/teacher/offers">{t('actions.cancel')}</Link>
                    </Button>
                    {data.is_public && data.is_active && (
                        <Badge variant="outline" className="self-center">
                            {t('teacher_offers.will_publish')}
                        </Badge>
                    )}
                </div>
            </form>
        </>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    error,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[][];
    error?: string;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {options.map(([optionValue, optionLabel]) => (
                        <SelectItem key={optionValue} value={optionValue}>{optionLabel}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <InputError message={error} />
        </div>
    );
}

function Toggle({
    checked,
    onChange,
    label,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}) {
    return (
        <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} />
            {label}
        </label>
    );
}

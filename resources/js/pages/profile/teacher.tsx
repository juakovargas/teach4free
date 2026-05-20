import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Eye, Image, Palette, Pause, Play, Presentation, Save, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type TeacherProfile = {
    headline: string | null;
    teaching_bio: string | null;
    experience_summary: string | null;
    public_intro: string | null;
    preferred_teaching_mode: string;
    max_students_per_session: number;
    default_session_duration_minutes: number;
    meeting_tool: string;
    meeting_url: string | null;
    banner: string | null;
    has_banner: boolean;
    profile_accent_color: string | null;
    show_badges: boolean;
    show_reviews: boolean;
    show_reputation_summary: boolean;
    show_completed_sessions_count: boolean;
    show_students_helped_count: boolean;
    show_teaching_hours: boolean;
    show_location: boolean;
    show_availability_summary: boolean;
    is_active: boolean;
    is_accepting_requests: boolean;
    is_verified: boolean;
    activated_at: string | null;
    paused_at: string | null;
    public_profile_url: string | null;
};

type Props = {
    profile: TeacherProfile;
    modes: string[];
    meetingTools: string[];
};

type VisibilityField =
    | 'show_badges'
    | 'show_reviews'
    | 'show_reputation_summary'
    | 'show_completed_sessions_count'
    | 'show_students_helped_count'
    | 'show_teaching_hours'
    | 'show_location'
    | 'show_availability_summary';

const DEFAULT_ACCENT_COLOR = '#0F766E';
const ACCENT_PRESETS = [
    '#0F766E',
    '#2563EB',
    '#7C3AED',
    '#D97706',
    '#BE123C',
    '#475569',
];
const PUBLIC_INTRO_MAX_LENGTH = 700;

export default function TeacherProfilePage({
    profile,
    modes,
    meetingTools,
}: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } =
        useForm<TeacherProfile>({
            ...profile,
            headline: profile.headline ?? '',
            public_intro: profile.public_intro ?? '',
            teaching_bio: profile.teaching_bio ?? '',
            experience_summary: profile.experience_summary ?? '',
            meeting_url: profile.meeting_url ?? '',
            profile_accent_color: profile.profile_accent_color ?? '',
        });
    const bannerForm = useForm<{ banner: File | null }>({ banner: null });
    const profileAccentColor = data.profile_accent_color ?? '';
    const hasValidAccent = /^#[0-9a-fA-F]{6}$/.test(profileAccentColor);
    const previewAccentColor = hasValidAccent
        ? profileAccentColor
        : DEFAULT_ACCENT_COLOR;
    const publicIntroLength = (data.public_intro ?? '').length;

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put('/profile/teacher', { preserveScroll: true });
    };

    const activate = () => router.post('/profile/teacher/activate');
    const pause = () => router.post('/profile/teacher/pause');
    const uploadBanner = () => {
        bannerForm.post('/profile/teacher/banner', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => bannerForm.reset('banner'),
        });
    };
    const removeBanner = () => {
        bannerForm.delete('/profile/teacher/banner', {
            preserveScroll: true,
        });
    };
    const visibilityFields: { field: VisibilityField; label: string }[] = [
        { field: 'show_badges', label: t('teacher_profile.show_badges') },
        { field: 'show_reviews', label: t('teacher_profile.show_reviews') },
        {
            field: 'show_reputation_summary',
            label: t('teacher_profile.show_reputation_summary'),
        },
        {
            field: 'show_completed_sessions_count',
            label: t('teacher_profile.show_completed_sessions_count'),
        },
        {
            field: 'show_students_helped_count',
            label: t('teacher_profile.show_students_helped_count'),
        },
        {
            field: 'show_teaching_hours',
            label: t('teacher_profile.show_teaching_hours'),
        },
        { field: 'show_location', label: t('teacher_profile.show_location') },
        {
            field: 'show_availability_summary',
            label: t('teacher_profile.show_availability_summary'),
        },
    ];

    return (
        <>
            <Head title={t('teacher_profile.meta_title')} />
            <form onSubmit={submit} className="space-y-8 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                        <div className="flex items-start gap-4">
                            <Presentation className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                            <div>
                                <h1 className="text-2xl font-semibold tracking-normal">
                                    {t('teacher_profile.title')}
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    {t('teacher_profile.intro')}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {profile.is_active && profile.public_profile_url && (
                                <Button type="button" variant="outline" asChild>
                                    <Link href={profile.public_profile_url}>
                                        <Eye />
                                        {t('teacher_profile.preview_public_profile')}
                                    </Link>
                                </Button>
                            )}
                            {profile.is_active ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={pause}
                                >
                                    <Pause />
                                    {t('teacher_profile.pause')}
                                </Button>
                            ) : (
                                <Button type="button" onClick={activate}>
                                    <Play />
                                    {t('teacher_profile.activate')}
                                </Button>
                            )}
                        </div>
                    </div>
                    {!profile.is_active && (
                        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100">
                            {t('teacher_profile.preview_inactive_message')}
                        </div>
                    )}
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                            <BadgeCheck className="mt-1 size-5 text-emerald-700 dark:text-emerald-300" />
                            <div>
                                <h2 className="font-semibold">
                                    {t('teacher_profile.badges_title')}
                                </h2>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                    {t('teacher_profile.badges_intro')}
                                </p>
                            </div>
                        </div>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/profile/teacher/badges">
                                <BadgeCheck />
                                {t('teacher_profile.manage_badges')}
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs lg:grid-cols-[1fr_18rem] dark:border-slate-800 dark:bg-slate-900">
                    <div>
                        <div className="flex items-start gap-3">
                            <Image className="mt-1 size-5 text-emerald-700 dark:text-emerald-300" />
                            <div>
                                <h2 className="font-semibold">
                                    {t('teacher_profile.banner_title')}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {t('teacher_profile.banner_intro')}
                                </p>
                            </div>
                        </div>
                        <div className="mt-5 grid gap-3">
                            <Input
                                id="teacher_banner"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) =>
                                    bannerForm.setData(
                                        'banner',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <p className="text-xs leading-5 text-muted-foreground">
                                {t('teacher_profile.banner_requirements')}
                            </p>
                            <InputError message={bannerForm.errors.banner} />
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    onClick={uploadBanner}
                                    disabled={
                                        bannerForm.processing ||
                                        !bannerForm.data.banner
                                    }
                                >
                                    <Image />
                                    {t('teacher_profile.upload_banner')}
                                </Button>
                                {profile.has_banner && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={removeBanner}
                                        disabled={bannerForm.processing}
                                    >
                                        <Trash2 />
                                        {t('teacher_profile.remove_banner')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                        {profile.banner ? (
                            <img
                                src={profile.banner}
                                alt={t('teacher_profile.banner_preview_alt')}
                                className="h-40 w-full object-cover"
                            />
                        ) : (
                            <div
                                className="h-40"
                                style={{
                                    background: `radial-gradient(circle at 18% 20%, ${previewAccentColor}55, transparent 10rem), radial-gradient(circle at 85% 10%, rgba(245,158,11,0.30), transparent 10rem), linear-gradient(135deg, #064e3b 0%, ${previewAccentColor} 48%, #78350f 100%)`,
                                }}
                            />
                        )}
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-3 md:col-span-2">
                        <Palette className="mt-1 size-5 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h2 className="font-semibold">
                                {t('teacher_profile.customization_title')}
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('teacher_profile.customization_intro')}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="public_intro">
                            {t('teacher_profile.public_intro')}
                        </Label>
                        <Textarea
                            id="public_intro"
                            value={data.public_intro ?? ''}
                            maxLength={PUBLIC_INTRO_MAX_LENGTH}
                            onChange={(event) =>
                                setData('public_intro', event.target.value)
                            }
                        />
                        <p className="text-xs leading-5 text-muted-foreground">
                            {t('teacher_profile.public_intro_hint')}{' '}
                            {t('teacher_profile.public_intro_character_count', {
                                count: publicIntroLength,
                                max: PUBLIC_INTRO_MAX_LENGTH,
                            })}
                        </p>
                        <InputError message={errors.public_intro} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="profile_accent_color">
                            {t('teacher_profile.profile_accent_color')}
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="profile_accent_color_picker"
                                type="color"
                                value={previewAccentColor}
                                onChange={(event) =>
                                    setData(
                                        'profile_accent_color',
                                        event.target.value,
                                    )
                                }
                                className="h-10 w-14 p-1"
                            />
                            <Input
                                id="profile_accent_color"
                                value={profileAccentColor}
                                onChange={(event) =>
                                    setData(
                                        'profile_accent_color',
                                        event.target.value,
                                    )
                                }
                                placeholder="#0F766E"
                            />
                        </div>
                        <div
                            className="flex flex-wrap gap-2"
                            aria-label={t('teacher_profile.accent_presets')}
                        >
                            {ACCENT_PRESETS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className="size-8 rounded-full border border-slate-300 ring-offset-background transition hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-700"
                                    style={{ backgroundColor: color }}
                                    onClick={() =>
                                        setData('profile_accent_color', color)
                                    }
                                    aria-label={t(
                                        'teacher_profile.accent_preset_label',
                                        { color },
                                    )}
                                    title={t(
                                        'teacher_profile.accent_preset_label',
                                        { color },
                                    )}
                                />
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setData('profile_accent_color', '')
                                }
                            >
                                {t('teacher_profile.use_default_accent')}
                            </Button>
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">
                            {t('teacher_profile.profile_accent_color_hint')}
                        </p>
                        <InputError message={errors.profile_accent_color} />
                    </div>
                    <div className="overflow-hidden rounded-lg border border-slate-200 md:col-span-2 dark:border-slate-800">
                        <div
                            className="h-20"
                            style={{
                                background: `linear-gradient(135deg, #064e3b 0%, ${previewAccentColor} 58%, #78350f 100%)`,
                            }}
                        />
                        <div className="space-y-3 p-4">
                            <div
                                className="h-1 w-24 rounded-full"
                                style={{ backgroundColor: previewAccentColor }}
                            />
                            <p className="font-semibold">
                                {data.headline ||
                                    t('teacher_profile.preview_headline')}
                            </p>
                            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                {data.public_intro ||
                                    t('teacher_profile.preview_intro')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="headline">
                            {t('teacher_profile.headline')}
                        </Label>
                        <Input
                            id="headline"
                            value={data.headline ?? ''}
                            onChange={(event) =>
                                setData('headline', event.target.value)
                            }
                        />
                        <InputError message={errors.headline} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max_students_per_session">
                            {t('teacher_profile.max_students')}
                        </Label>
                        <Input
                            id="max_students_per_session"
                            type="number"
                            min={1}
                            max={100}
                            value={data.max_students_per_session}
                            onChange={(event) =>
                                setData(
                                    'max_students_per_session',
                                    Number(event.target.value),
                                )
                            }
                        />
                        <InputError message={errors.max_students_per_session} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="default_session_duration_minutes">
                            {t('teacher_profile.default_duration')}
                        </Label>
                        <Input
                            id="default_session_duration_minutes"
                            type="number"
                            min={15}
                            max={240}
                            value={data.default_session_duration_minutes}
                            onChange={(event) =>
                                setData(
                                    'default_session_duration_minutes',
                                    Number(event.target.value),
                                )
                            }
                        />
                        <InputError
                            message={errors.default_session_duration_minutes}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="teaching_bio">
                            {t('teacher_profile.teaching_bio')}
                        </Label>
                        <Textarea
                            id="teaching_bio"
                            value={data.teaching_bio ?? ''}
                            onChange={(event) =>
                                setData('teaching_bio', event.target.value)
                            }
                        />
                        <InputError message={errors.teaching_bio} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="experience_summary">
                            {t('teacher_profile.experience_summary')}
                        </Label>
                        <Textarea
                            id="experience_summary"
                            value={data.experience_summary ?? ''}
                            onChange={(event) =>
                                setData(
                                    'experience_summary',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={errors.experience_summary} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('teacher_profile.teaching_mode')}</Label>
                        <Select
                            value={data.preferred_teaching_mode}
                            onValueChange={(value) =>
                                setData('preferred_teaching_mode', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {modes.map((mode) => (
                                    <SelectItem key={mode} value={mode}>
                                        {t(`learning_modes.${mode}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.preferred_teaching_mode} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('teacher_profile.meeting_tool')}</Label>
                        <Select
                            value={data.meeting_tool}
                            onValueChange={(value) =>
                                setData('meeting_tool', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {meetingTools.map((tool) => (
                                    <SelectItem key={tool} value={tool}>
                                        {t(`meeting_tools.${tool}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.meeting_tool} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="meeting_url">
                            {t('teacher_profile.meeting_url')}
                        </Label>
                        <Input
                            id="meeting_url"
                            value={data.meeting_url ?? ''}
                            onChange={(event) =>
                                setData('meeting_url', event.target.value)
                            }
                            placeholder="https://"
                        />
                        <InputError message={errors.meeting_url} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="is_accepting_requests"
                            checked={data.is_accepting_requests}
                            disabled={!profile.is_active}
                            onCheckedChange={(checked) =>
                                setData(
                                    'is_accepting_requests',
                                    checked === true,
                                )
                            }
                        />
                        <Label htmlFor="is_accepting_requests">
                            {t('teacher_profile.accepting_requests')}
                        </Label>
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-3">
                        <Eye className="mt-1 size-5 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h2 className="font-semibold">
                                {t('teacher_profile.section_visibility_title')}
                            </h2>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('teacher_profile.section_visibility_intro')}
                            </p>
                        </div>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {visibilityFields.map(({ field, label }) => (
                            <label
                                key={field}
                                className="flex items-center gap-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800"
                                htmlFor={field}
                            >
                                <Checkbox
                                    id={field}
                                    checked={data[field]}
                                    onCheckedChange={(checked) =>
                                        setData(field, checked === true)
                                    }
                                />
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                </section>

                <ContextualHelp title={t('teacher_profile.help_title')}>
                    {t('teacher_profile.help_body')}
                </ContextualHelp>

                <div className="rounded-lg border border-cyan-200 bg-cyan-50/80 p-4 text-sm text-cyan-950 dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-50">
                    {t('teacher_profile.external_meeting_note')}
                </div>

                <Button disabled={processing}>
                    <Save />
                    {t('actions.save')}
                </Button>
            </form>
        </>
    );
}

TeacherProfilePage.layout = {
    breadcrumbs: [
        {
            title: 'navigation.teacher_profile',
            href: '/profile/teacher',
        },
    ],
};

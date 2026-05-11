import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Camera, Globe2, Languages, Save, Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Language = {
    id: number;
    code: string;
    name: string;
    native_name: string;
};

type LanguagePreference = {
    language_id: number;
    understands: boolean;
    speaks: boolean;
    teaches: boolean;
    level: string | null;
};

type Profile = {
    name: string;
    preferred_locale: string;
    timezone: string;
    bio: string | null;
    is_public: boolean;
    learning_interests: string | null;
    teaching_interests: string | null;
    avatar: string | null;
    has_local_avatar: boolean;
};

type Props = {
    profile: Profile;
    languages: Language[];
    userLanguages: Record<string, Omit<LanguagePreference, 'language_id'>>;
    languageLevels: string[];
    timezones: string[];
};

type PreferencesForm = Profile & {
    languages: LanguagePreference[];
};

export default function Preferences({
    profile,
    languages,
    userLanguages,
    languageLevels,
    timezones,
}: Props) {
    const { t, locales } = useTranslation();
    const { flash } = usePage().props;
    const getInitials = useInitials();

    const { data, setData, put, processing, errors } =
        useForm<PreferencesForm>({
            ...profile,
            bio: profile.bio ?? '',
            learning_interests: profile.learning_interests ?? '',
            teaching_interests: profile.teaching_interests ?? '',
            languages: languages.map((language) => {
                const existing = userLanguages[String(language.id)];

                return {
                    language_id: language.id,
                    understands: existing?.understands ?? false,
                    speaks: existing?.speaks ?? false,
                    teaches: existing?.teaches ?? false,
                    level: existing?.level ?? null,
                };
            }),
        });
    const avatarForm = useForm<{ avatar: File | null }>({
        avatar: null,
    });

    const updateLanguage = (
        languageId: number,
        update: Partial<LanguagePreference>,
    ) => {
        setData(
            'languages',
            data.languages.map((language) => {
                if (language.language_id !== languageId) {
                    return language;
                }

                const next = { ...language, ...update };

                if (next.teaches) {
                    next.speaks = true;
                }

                return next;
            }),
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put('/profile/preferences', { preserveScroll: true });
    };

    const submitAvatar = () => {
        avatarForm.post('/profile/preferences/avatar', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => avatarForm.reset('avatar'),
        });
    };

    const removeAvatar = () => {
        router.delete('/profile/preferences/avatar', {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={t('profile_preferences.meta_title')} />
            <form onSubmit={submit} className="space-y-8 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Globe2 className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {t('profile_preferences.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('profile_preferences.intro')}
                            </p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16 overflow-hidden rounded-full">
                                <AvatarImage
                                    src={profile.avatar ?? undefined}
                                    alt={profile.name}
                                />
                                <AvatarFallback className="bg-emerald-100 text-lg font-semibold text-emerald-900 dark:bg-emerald-900 dark:text-emerald-50">
                                    {getInitials(profile.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold">
                                    {t('profile_preferences.avatar_title')}
                                </h2>
                                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                    {t('profile_preferences.avatar_intro')}
                                </p>
                            </div>
                        </div>
                        {profile.has_local_avatar && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={removeAvatar}
                            >
                                <Trash2 />
                                {t('profile_preferences.remove_avatar')}
                            </Button>
                        )}
                    </div>
                    <div
                        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
                    >
                        <div className="w-full max-w-md space-y-2">
                            <Label htmlFor="avatar">
                                {t('profile_preferences.avatar_file')}
                            </Label>
                            <Input
                                id="avatar"
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                    avatarForm.setData(
                                        'avatar',
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <InputError message={avatarForm.errors.avatar} />
                        </div>
                        <Button
                            type="button"
                            onClick={submitAvatar}
                            disabled={
                                avatarForm.processing || !avatarForm.data.avatar
                            }
                        >
                            <Camera />
                            {t('profile_preferences.upload_avatar')}
                        </Button>
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {t('profile_preferences.name')}
                        </Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="preferred_locale">
                            {t('profile_preferences.preferred_locale')}
                        </Label>
                        <Select
                            value={data.preferred_locale}
                            onValueChange={(value) =>
                                setData('preferred_locale', value)
                            }
                        >
                            <SelectTrigger id="preferred_locale">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {locales.map((locale) => (
                                    <SelectItem
                                        key={locale.code}
                                        value={locale.code}
                                    >
                                        {locale.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.preferred_locale} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">
                            {t('profile_preferences.timezone')}
                        </Label>
                        <Select
                            value={data.timezone}
                            onValueChange={(value) =>
                                setData('timezone', value)
                            }
                        >
                            <SelectTrigger id="timezone">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {timezones.map((timezone) => (
                                    <SelectItem key={timezone} value={timezone}>
                                        {timezone}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.timezone} />
                    </div>

                    <div className="flex items-center gap-3 pt-8">
                        <Checkbox
                            id="is_public"
                            checked={data.is_public}
                            onCheckedChange={(checked) =>
                                setData('is_public', checked === true)
                            }
                        />
                        <Label htmlFor="is_public">
                            {t('profile_preferences.public_profile')}
                        </Label>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">
                            {t('profile_preferences.bio')}
                        </Label>
                        <Textarea
                            id="bio"
                            value={data.bio ?? ''}
                            onChange={(event) =>
                                setData('bio', event.target.value)
                            }
                        />
                        <InputError message={errors.bio} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="learning_interests">
                            {t('profile_preferences.learning_interests')}
                        </Label>
                        <Textarea
                            id="learning_interests"
                            value={data.learning_interests ?? ''}
                            onChange={(event) =>
                                setData(
                                    'learning_interests',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={errors.learning_interests} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="teaching_interests">
                            {t('profile_preferences.teaching_interests')}
                        </Label>
                        <Textarea
                            id="teaching_interests"
                            value={data.teaching_interests ?? ''}
                            onChange={(event) =>
                                setData(
                                    'teaching_interests',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={errors.teaching_interests} />
                    </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-5 flex items-start gap-3">
                        <Languages className="mt-1 size-5 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h2 className="font-semibold">
                                {t('profile_preferences.languages_title')}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t('profile_preferences.languages_intro')}
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        {languages.map((language) => {
                            const preference = data.languages.find(
                                (item) => item.language_id === language.id,
                            );

                            if (!preference) {
                                return null;
                            }

                            return (
                                <div
                                    key={language.id}
                                    className="grid gap-4 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_auto_auto_auto_11rem] md:items-center dark:border-slate-800"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {language.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {language.native_name}
                                        </p>
                                    </div>
                                    {(['understands', 'speaks', 'teaches'] as const).map(
                                        (field) => (
                                            <label
                                                key={field}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={
                                                        preference[field]
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        updateLanguage(
                                                            language.id,
                                                            {
                                                                [field]:
                                                                    checked ===
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                />
                                                {t(
                                                    `profile_preferences.${field}`,
                                                )}
                                            </label>
                                        ),
                                    )}
                                    <Select
                                        value={preference.level ?? 'none'}
                                        onValueChange={(value) =>
                                            updateLanguage(language.id, {
                                                level:
                                                    value === 'none'
                                                        ? null
                                                        : value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                {t(
                                                    'profile_preferences.no_level',
                                                )}
                                            </SelectItem>
                                            {languageLevels.map((level) => (
                                                <SelectItem
                                                    key={level}
                                                    value={level}
                                                >
                                                    {t(
                                                        `language_levels.${level}`,
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                        {t('profile_preferences.teaches_rule')}
                    </p>
                </section>

                <ContextualHelp title={t('profile_preferences.help_title')}>
                    {t('profile_preferences.help_body')}
                </ContextualHelp>

                <Button disabled={processing}>
                    <Save />
                    {t('actions.save')}
                </Button>
            </form>
        </>
    );
}

Preferences.layout = {
    breadcrumbs: [
        {
            title: 'navigation.preferences',
            href: '/profile/preferences',
        },
    ],
};

import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpenCheck, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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

type StudentProfile = {
    learning_goals: string | null;
    current_level: string;
    preferred_learning_mode: string;
    availability_notes: string | null;
    is_active: boolean;
};

type Props = {
    profile: StudentProfile;
    levels: string[];
    modes: string[];
};

export default function StudentProfilePage({ profile, levels, modes }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { data, setData, put, processing, errors } =
        useForm<StudentProfile>({
            ...profile,
            learning_goals: profile.learning_goals ?? '',
            availability_notes: profile.availability_notes ?? '',
        });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put('/profile/student', { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('student_profile.meta_title')} />
            <form onSubmit={submit} className="space-y-8 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <BookOpenCheck className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {t('student_profile.title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('student_profile.intro')}
                            </p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="learning_goals">
                            {t('student_profile.learning_goals')}
                        </Label>
                        <Textarea
                            id="learning_goals"
                            value={data.learning_goals ?? ''}
                            onChange={(event) =>
                                setData('learning_goals', event.target.value)
                            }
                        />
                        <InputError message={errors.learning_goals} />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('student_profile.current_level')}</Label>
                        <Select
                            value={data.current_level}
                            onValueChange={(value) =>
                                setData('current_level', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {levels.map((level) => (
                                    <SelectItem key={level} value={level}>
                                        {t(`student_levels.${level}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.current_level} />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            {t('student_profile.preferred_learning_mode')}
                        </Label>
                        <Select
                            value={data.preferred_learning_mode}
                            onValueChange={(value) =>
                                setData('preferred_learning_mode', value)
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
                        <InputError message={errors.preferred_learning_mode} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="availability_notes">
                            {t('student_profile.availability_notes')}
                        </Label>
                        <Textarea
                            id="availability_notes"
                            value={data.availability_notes ?? ''}
                            onChange={(event) =>
                                setData(
                                    'availability_notes',
                                    event.target.value,
                                )
                            }
                        />
                        <InputError message={errors.availability_notes} />
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="is_active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData('is_active', checked === true)
                            }
                        />
                        <Label htmlFor="is_active">
                            {t('student_profile.active_as_student')}
                        </Label>
                    </div>
                </section>

                <ContextualHelp title={t('student_profile.help_title')}>
                    {t('student_profile.help_body')}
                </ContextualHelp>

                <Button disabled={processing}>
                    <Save />
                    {t('actions.save')}
                </Button>
            </form>
        </>
    );
}

StudentProfilePage.layout = {
    breadcrumbs: [
        {
            title: 'navigation.learning_profile',
            href: '/profile/student',
        },
    ],
};

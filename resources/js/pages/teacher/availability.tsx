import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Availability = {
    id: number;
    day_of_week: number;
    starts_at: string;
    ends_at: string;
    timezone: string;
    default_duration_minutes: number;
    default_capacity: number;
    is_active: boolean;
    notes: string | null;
};

type AvailabilityException = {
    id: number;
    date: string;
    starts_at: string | null;
    ends_at: string | null;
    type: string;
    reason: string | null;
    is_full_day: boolean;
};

type Props = {
    canManage: boolean;
    availabilities: Availability[];
    exceptions: AvailabilityException[];
};

export default function TeacherAvailability({ canManage, availabilities, exceptions }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };

    return (
        <>
            <Head title={t('teacher_availability.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <CalendarClock className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('teacher_availability.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('teacher_availability.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                {!canManage && (
                    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                        <p>{t('teacher_availability.not_ready')}</p>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/profile/teacher">{t('teacher_availability.open_teacher_profile')}</Link>
                        </Button>
                    </section>
                )}

                {canManage && (
                    <section className="grid gap-6 xl:grid-cols-[1fr_24rem]">
                        <div className="space-y-4">
                            <AddAvailabilityForm />
                            <AvailabilityList availabilities={availabilities} />
                        </div>
                        <div className="space-y-4">
                            <AddExceptionForm />
                            <ExceptionList exceptions={exceptions} />
                        </div>
                    </section>
                )}

                <ContextualHelp title={t('teacher_availability.help_title')}>
                    {t('teacher_availability.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function AddAvailabilityForm() {
    const { t } = useTranslation();
    const form = useForm({
        day_of_week: '1',
        starts_at: '09:00',
        ends_at: '10:00',
        timezone: 'Europe/Madrid',
        default_duration_minutes: '60',
        default_capacity: '1',
        is_active: true,
        notes: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/teacher/availability', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold">{t('teacher_availability.add_block')}</h2>
            <AvailabilityFields form={form} />
            <Button disabled={form.processing} className="w-fit">
                <Plus />
                {t('teacher_availability.add_block')}
            </Button>
        </form>
    );
}

function AvailabilityList({ availabilities }: { availabilities: Availability[] }) {
    const { t } = useTranslation();

    return (
        <section className="grid gap-3">
            <h2 className="text-lg font-semibold">{t('teacher_availability.weekly_blocks')}</h2>
            {availabilities.length === 0 && <Empty>{t('teacher_availability.no_blocks')}</Empty>}
            {availabilities.map((availability) => (
                <AvailabilityRow key={availability.id} availability={availability} />
            ))}
        </section>
    );
}

function AvailabilityRow({ availability }: { availability: Availability }) {
    const { t } = useTranslation();
    const form = useForm({
        day_of_week: String(availability.day_of_week),
        starts_at: availability.starts_at.slice(0, 5),
        ends_at: availability.ends_at.slice(0, 5),
        timezone: availability.timezone,
        default_duration_minutes: String(availability.default_duration_minutes),
        default_capacity: String(availability.default_capacity),
        is_active: availability.is_active,
        notes: availability.notes ?? '',
    });
    const destroyForm = useForm({});

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.patch(`/teacher/availability/${availability.id}`, { preserveScroll: true });
            }}
            className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
            <AvailabilityFields form={form} compact />
            <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={form.processing}>{t('actions.save')}</Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={destroyForm.processing}
                    onClick={() => destroyForm.delete(`/teacher/availability/${availability.id}`, { preserveScroll: true })}
                >
                    <Trash2 />
                    {t('actions.delete')}
                </Button>
            </div>
        </form>
    );
}

function AvailabilityFields({
    form,
    compact = false,
}: {
    form: ReturnType<typeof useForm<{
        day_of_week: string;
        starts_at: string;
        ends_at: string;
        timezone: string;
        default_duration_minutes: string;
        default_capacity: string;
        is_active: boolean;
        notes: string;
    }>>;
    compact?: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div className={compact ? 'grid gap-3 md:grid-cols-4' : 'grid gap-3 md:grid-cols-2'}>
            <Field label={t('teacher_availability.day')}>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.data.day_of_week} onChange={(event) => form.setData('day_of_week', event.target.value)}>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{t(`weekdays.${day}`)}</option>)}
                </select>
            </Field>
            <Field label={t('teacher_availability.starts_at')} error={form.errors.starts_at}>
                <Input type="time" value={form.data.starts_at} onChange={(event) => form.setData('starts_at', event.target.value)} />
            </Field>
            <Field label={t('teacher_availability.ends_at')} error={form.errors.ends_at}>
                <Input type="time" value={form.data.ends_at} onChange={(event) => form.setData('ends_at', event.target.value)} />
            </Field>
            <Field label={t('teacher_availability.timezone')} error={form.errors.timezone}>
                <Input value={form.data.timezone} onChange={(event) => form.setData('timezone', event.target.value)} />
            </Field>
            <Field label={t('teacher_availability.default_duration')} error={form.errors.default_duration_minutes}>
                <Input type="number" min="15" max="240" value={form.data.default_duration_minutes} onChange={(event) => form.setData('default_duration_minutes', event.target.value)} />
            </Field>
            <Field label={t('teacher_availability.default_capacity')} error={form.errors.default_capacity}>
                <Input type="number" min="1" max="500" value={form.data.default_capacity} onChange={(event) => form.setData('default_capacity', event.target.value)} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.data.is_active} onCheckedChange={(checked) => form.setData('is_active', Boolean(checked))} />
                {t('teacher_availability.active')}
            </label>
            <Field label={t('teacher_availability.notes')} error={form.errors.notes}>
                <Textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} />
            </Field>
        </div>
    );
}

function AddExceptionForm() {
    const { t } = useTranslation();
    const form = useForm({
        date: '',
        starts_at: '',
        ends_at: '',
        type: 'unavailable',
        reason: '',
        is_full_day: true,
    });

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.post('/teacher/availability/exceptions', { preserveScroll: true });
            }}
            className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
            <h2 className="text-lg font-semibold">{t('teacher_availability.add_exception')}</h2>
            <ExceptionFields form={form} />
            <Button disabled={form.processing} className="w-fit">
                <Plus />
                {t('teacher_availability.add_exception')}
            </Button>
        </form>
    );
}

function ExceptionList({ exceptions }: { exceptions: AvailabilityException[] }) {
    const { t } = useTranslation();

    return (
        <section className="grid gap-3">
            <h2 className="text-lg font-semibold">{t('teacher_availability.exceptions')}</h2>
            {exceptions.length === 0 && <Empty>{t('teacher_availability.no_exceptions')}</Empty>}
            {exceptions.map((exception) => (
                <ExceptionRow key={exception.id} exception={exception} />
            ))}
        </section>
    );
}

function ExceptionRow({ exception }: { exception: AvailabilityException }) {
    const { t } = useTranslation();
    const form = useForm({
        date: exception.date.slice(0, 10),
        starts_at: exception.starts_at?.slice(0, 5) ?? '',
        ends_at: exception.ends_at?.slice(0, 5) ?? '',
        type: exception.type,
        reason: exception.reason ?? '',
        is_full_day: exception.is_full_day,
    });
    const destroyForm = useForm({});

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                form.patch(`/teacher/availability/exceptions/${exception.id}`, { preserveScroll: true });
            }}
            className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
            <ExceptionFields form={form} />
            <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={form.processing}>{t('actions.save')}</Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={destroyForm.processing}
                    onClick={() => destroyForm.delete(`/teacher/availability/exceptions/${exception.id}`, { preserveScroll: true })}
                >
                    <Trash2 />
                    {t('actions.delete')}
                </Button>
            </div>
        </form>
    );
}

function ExceptionFields({
    form,
}: {
    form: ReturnType<typeof useForm<{
        date: string;
        starts_at: string;
        ends_at: string;
        type: string;
        reason: string;
        is_full_day: boolean;
    }>>;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-3">
            <Field label={t('teacher_availability.date')} error={form.errors.date}>
                <Input type="date" value={form.data.date} onChange={(event) => form.setData('date', event.target.value)} />
            </Field>
            <Field label={t('teacher_availability.exception_type')} error={form.errors.type}>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.data.type} onChange={(event) => form.setData('type', event.target.value)}>
                    <option value="unavailable">{t('availability_exception_types.unavailable')}</option>
                    <option value="extra_available">{t('availability_exception_types.extra_available')}</option>
                </select>
            </Field>
            <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.data.is_full_day} onCheckedChange={(checked) => form.setData('is_full_day', Boolean(checked))} />
                {t('teacher_availability.full_day')}
            </label>
            {!form.data.is_full_day && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t('teacher_availability.starts_at')} error={form.errors.starts_at}>
                        <Input type="time" value={form.data.starts_at} onChange={(event) => form.setData('starts_at', event.target.value)} />
                    </Field>
                    <Field label={t('teacher_availability.ends_at')} error={form.errors.ends_at}>
                        <Input type="time" value={form.data.ends_at} onChange={(event) => form.setData('ends_at', event.target.value)} />
                    </Field>
                </div>
            )}
            <Field label={t('teacher_availability.reason')} error={form.errors.reason}>
                <Textarea value={form.data.reason} onChange={(event) => form.setData('reason', event.target.value)} />
            </Field>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function Empty({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {children}
        </div>
    );
}

TeacherAvailability.layout = {
    breadcrumbs: [
        {
            title: 'navigation.my_availability',
            href: '/teacher/availability',
        },
    ],
};

import { Head, Link, router } from '@inertiajs/react';
import { Filter, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AdminPagination } from '@/components/admin-pagination';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type Student = {
    id: number;
    name: string;
    email: string;
    city?: string | null;
    country_code?: string | null;
    avatar?: string | null;
    initials: string;
    applications_count: number;
    pending_applications_count: number;
    student_profile: {
        current_level?: string | null;
        preferred_learning_mode?: string | null;
        is_active: boolean;
    };
};

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    students: Paginator<Student>;
    filters: {
        search: string;
        status: string;
    };
    summary: {
        total: number;
        active: number;
        applications: number;
        pending_applications: number;
    };
};

export default function AdminStudents({ students, filters, summary }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/students', form, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('admin_students.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <GraduationCap className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_students.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_students.intro')}</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label={t('admin_students.total')} value={summary.total} />
                    <Stat label={t('admin_students.active')} value={summary.active} />
                    <Stat label={t('admin_students.applications')} value={summary.applications} />
                    <Stat label={t('admin_students.pending_applications')} value={summary.pending_applications} />
                </section>

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_12rem_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('admin_students.search')}</Label>
                        <Input id="search" value={form.search} onChange={(event) => setForm({ ...form, search: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">{t('admin_students.status')}</Label>
                        <select id="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            {['all', 'active', 'inactive'].map((status) => (
                                <option key={status} value={status}>{t(`admin_student_statuses.${status}`)}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <Button type="submit" className="w-full">
                            <Filter />
                            {t('actions.filter')}
                        </Button>
                    </div>
                </form>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_students.student')}</th>
                                    <th className="px-4 py-3">{t('admin_students.level')}</th>
                                    <th className="px-4 py-3">{t('admin_students.mode')}</th>
                                    <th className="px-4 py-3">{t('admin_students.location')}</th>
                                    <th className="px-4 py-3">{t('admin_students.applications')}</th>
                                    <th className="px-4 py-3">{t('admin_students.pending_applications')}</th>
                                    <th className="px-4 py-3">{t('admin_students.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_students.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">{t('admin_students.empty')}</td>
                                    </tr>
                                )}
                                {students.data.map((student) => (
                                    <tr key={student.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {student.avatar ? (
                                                    <img src={student.avatar} alt="" className="size-10 rounded-full object-cover" />
                                                ) : (
                                                    <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{student.initials}</span>
                                                )}
                                                <div>
                                                    <p className="font-medium">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">{student.student_profile.current_level ? t(`student_levels.${student.student_profile.current_level}`) : t('common.none')}</td>
                                        <td className="px-4 py-4">{student.student_profile.preferred_learning_mode ? t(`learning_modes.${student.student_profile.preferred_learning_mode}`) : t('common.none')}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{[student.city, student.country_code].filter(Boolean).join(', ') || t('common.none')}</td>
                                        <td className="px-4 py-4">{student.applications_count}</td>
                                        <td className="px-4 py-4">{student.pending_applications_count}</td>
                                        <td className="px-4 py-4">
                                            <Badge variant={student.student_profile.is_active ? 'default' : 'outline'}>
                                                {t(student.student_profile.is_active ? 'statuses.active' : 'statuses.inactive')}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/admin/users/${student.id}`}>{t('actions.view')}</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <AdminPagination links={students.links} />

                <ContextualHelp title={t('admin_students.help_title')}>
                    {t('admin_students.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
        </article>
    );
}

import { Head, Link, router } from '@inertiajs/react';
import { Filter, Presentation, UserCheck } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AdminPagination } from '@/components/admin-pagination';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';

type Teacher = {
    id: number;
    name: string;
    email: string;
    city?: string | null;
    country_code?: string | null;
    avatar?: string | null;
    initials: string;
    public_offers_count: number;
    availability_blocks_count: number;
    teacher_profile: {
        headline?: string | null;
        is_active: boolean;
        is_verified: boolean;
        is_accepting_requests: boolean;
        activated_at?: string | null;
        banner_path?: string | null;
        show_badges: boolean;
        show_reviews: boolean;
        show_reputation_summary: boolean;
    };
};

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    teachers: Paginator<Teacher>;
    filters: {
        search: string;
        status: string;
    };
    summary: {
        total: number;
        active: number;
        verified: number;
        public_offers: number;
    };
};

export default function AdminTeachers({ teachers, filters, summary }: Props) {
    const { t } = useTranslation();
    const [form, setForm] = useState(filters);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/teachers', form, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('admin_teachers.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Presentation className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_teachers.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_teachers.intro')}</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat label={t('admin_teachers.total')} value={summary.total} />
                    <Stat label={t('admin_teachers.active')} value={summary.active} />
                    <Stat label={t('admin_teachers.verified')} value={summary.verified} />
                    <Stat label={t('admin_teachers.public_offers')} value={summary.public_offers} />
                </section>

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_12rem_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('admin_teachers.search')}</Label>
                        <Input id="search" value={form.search} onChange={(event) => setForm({ ...form, search: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">{t('admin_teachers.status')}</Label>
                        <select id="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            {['all', 'active', 'paused', 'verified', 'unverified'].map((status) => (
                                <option key={status} value={status}>{t(`admin_teacher_statuses.${status}`)}</option>
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
                                    <th className="px-4 py-3">{t('admin_teachers.teacher')}</th>
                                    <th className="px-4 py-3">{t('admin_teachers.headline')}</th>
                                    <th className="px-4 py-3">{t('admin_teachers.location')}</th>
                                    <th className="px-4 py-3">{t('admin_teachers.offers')}</th>
                                    <th className="px-4 py-3">{t('admin_teachers.availability')}</th>
                                    <th className="px-4 py-3">{t('admin_teachers.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_teachers.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">{t('admin_teachers.empty')}</td>
                                    </tr>
                                )}
                                {teachers.data.map((teacher) => (
                                    <tr key={teacher.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {teacher.avatar ? (
                                                    <img src={teacher.avatar} alt="" className="size-10 rounded-full object-cover" />
                                                ) : (
                                                    <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">{teacher.initials}</span>
                                                )}
                                                <div>
                                                    <p className="font-medium">{teacher.name}</p>
                                                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-muted-foreground">{teacher.teacher_profile.headline ?? t('common.none')}</td>
                                        <td className="px-4 py-4 text-muted-foreground">{[teacher.city, teacher.country_code].filter(Boolean).join(', ') || t('common.none')}</td>
                                        <td className="px-4 py-4">{teacher.public_offers_count}</td>
                                        <td className="px-4 py-4">{teacher.availability_blocks_count}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant={teacher.teacher_profile.is_active ? 'default' : 'outline'}>{t(teacher.teacher_profile.is_active ? 'statuses.active' : 'statuses.paused')}</Badge>
                                                {teacher.teacher_profile.is_verified && (
                                                    <Badge variant="outline">
                                                        <UserCheck className="size-3" />
                                                        {t('admin_teachers.verified_badge')}
                                                    </Badge>
                                                )}
                                                {teacher.teacher_profile.banner_path && (
                                                    <Badge variant="outline">{t('admin_teachers.custom_banner')}</Badge>
                                                )}
                                                {!teacher.teacher_profile.show_badges && (
                                                    <Badge variant="outline">{t('admin_teachers.badges_hidden')}</Badge>
                                                )}
                                                {!teacher.teacher_profile.show_reviews && (
                                                    <Badge variant="outline">{t('admin_teachers.reviews_hidden')}</Badge>
                                                )}
                                                {!teacher.teacher_profile.show_reputation_summary && (
                                                    <Badge variant="outline">{t('admin_teachers.reputation_hidden')}</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {teacher.teacher_profile.is_active && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/teachers/${teacher.id}`}>{t('admin_teachers.public_profile')}</Link>
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/users/${teacher.id}`}>{t('actions.view')}</Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <AdminPagination links={teachers.links} />

                <ContextualHelp title={t('admin_teachers.help_title')}>
                    {t('admin_teachers.help_body')}
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

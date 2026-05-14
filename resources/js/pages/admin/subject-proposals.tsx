import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Filter, GitMerge, Save } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AdminPagination } from '@/components/admin-pagination';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Category = {
    id: number;
    name: string;
    slug: string;
    color?: string | null;
};

type Subject = {
    id: number;
    teaching_category_id: number;
    name: string;
    slug: string;
    category?: { name: string } | null;
};

type Proposal = {
    id: number;
    name: string;
    description?: string | null;
    status: string;
    admin_notes?: string | null;
    created_at: string;
    proposer?: { name: string; email: string } | null;
    reviewer?: { name: string; email: string } | null;
    category?: Category | null;
    category_proposal?: { id: number; name: string; status: string; approved_category_id?: number | null } | null;
    approved_subject?: Subject | null;
};

type Paginator<T> = {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    proposals: Paginator<Proposal>;
    filters: {
        status: string;
        search: string;
    };
    statuses: string[];
    categories: Category[];
    subjects: Subject[];
};

export default function AdminSubjectProposals({ proposals, filters, statuses, categories, subjects }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const [filterForm, setFilterForm] = useState(filters);

    const submitFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/subject-proposals', filterForm, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title={t('admin_subject_proposals.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <GitMerge className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_subject_proposals.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_subject_proposals.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={submitFilters} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[1fr_12rem_auto]">
                    <div className="grid gap-2">
                        <Label htmlFor="search">{t('admin_subject_proposals.search')}</Label>
                        <Input id="search" value={filterForm.search} onChange={(event) => setFilterForm({ ...filterForm, search: event.target.value })} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">{t('admin_subject_proposals.status')}</Label>
                        <select id="status" value={filterForm.status} onChange={(event) => setFilterForm({ ...filterForm, status: event.target.value })} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            {['all', ...statuses].map((status) => (
                                <option key={status} value={status}>{status === 'all' ? t('common.all') : t(`proposal_statuses.${status}`)}</option>
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

                <section className="grid gap-4">
                    {proposals.data.length === 0 && (
                        <article className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {t('admin_subject_proposals.empty')}
                        </article>
                    )}
                    {proposals.data.map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} categories={categories} subjects={subjects} />
                    ))}
                </section>

                <AdminPagination links={proposals.links} />

                <ContextualHelp title={t('admin_subject_proposals.help_title')}>
                    {t('admin_subject_proposals.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function ProposalCard({ proposal, categories, subjects }: { proposal: Proposal; categories: Category[]; subjects: Subject[] }) {
    const { t } = useTranslation();
    const fallbackCategoryId = proposal.category?.id ?? proposal.category_proposal?.approved_category_id ?? categories[0]?.id ?? '';
    const form = useForm({
        action: proposal.status === 'approved' ? 'approve' : proposal.status === 'merged' ? 'merge' : proposal.status === 'rejected' ? 'reject' : 'approve',
        admin_notes: proposal.admin_notes ?? '',
        teaching_category_id: fallbackCategoryId ? String(fallbackCategoryId) : '',
        existing_subject_id: proposal.approved_subject?.id ? String(proposal.approved_subject.id) : '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/subject-proposals/${proposal.id}`, { preserveScroll: true });
    };

    return (
        <article className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 xl:grid-cols-[1fr_28rem]">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{proposal.name}</h2>
                    <Badge variant={proposal.status === 'pending' ? 'default' : 'outline'}>{t(`proposal_statuses.${proposal.status}`)}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{proposal.description ?? t('common.none')}</p>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Info label={t('admin_subject_proposals.proposer')} value={proposal.proposer?.name ?? t('common.none')} />
                    <Info label={t('admin_subject_proposals.category')} value={proposal.category?.name ?? proposal.category_proposal?.name ?? t('common.none')} />
                    <Info label={t('admin_subject_proposals.approved_subject')} value={proposal.approved_subject?.name ?? t('common.none')} />
                    <Info label={t('admin_subject_proposals.created')} value={new Date(proposal.created_at).toLocaleDateString()} />
                </div>
            </div>
            <form onSubmit={submit} className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="grid gap-2">
                    <Label>{t('admin_subject_proposals.action')}</Label>
                    <select value={form.data.action} onChange={(event) => form.setData('action', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                        <option value="approve">{t('admin_subject_proposals.approve')}</option>
                        <option value="reject">{t('admin_subject_proposals.reject')}</option>
                        <option value="merge">{t('admin_subject_proposals.merge')}</option>
                    </select>
                </div>
                {form.data.action === 'approve' && (
                    <div className="grid gap-2">
                        <Label>{t('admin_subject_proposals.category')}</Label>
                        <select value={form.data.teaching_category_id} onChange={(event) => form.setData('teaching_category_id', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="">{t('admin_subject_proposals.choose_category')}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={String(category.id)}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                {form.data.action === 'merge' && (
                    <div className="grid gap-2">
                        <Label>{t('admin_subject_proposals.existing_subject')}</Label>
                        <select value={form.data.existing_subject_id} onChange={(event) => form.setData('existing_subject_id', event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                            <option value="">{t('admin_subject_proposals.choose_subject')}</option>
                            {subjects.map((subject) => (
                                <option key={subject.id} value={String(subject.id)}>{subject.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="grid gap-2">
                    <Label>{t('admin_subject_proposals.admin_notes')}</Label>
                    <Textarea value={form.data.admin_notes} onChange={(event) => form.setData('admin_notes', event.target.value)} rows={3} />
                </div>
                <Button type="submit" disabled={form.processing}>
                    <Save />
                    {t('actions.save')}
                </Button>
            </form>
        </article>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-slate-200 p-3 dark:border-slate-800">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-medium">{value}</p>
        </div>
    );
}

import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpenCheck, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/use-translation';

type Category = {
    id: number;
    name: string;
    slug: string;
};

type Subject = {
    id: number;
    teaching_category_id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    subject: Subject | null;
    categories: Category[];
};

type SubjectForm = {
    teaching_category_id: number | null;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
    sort_order: number;
};

export default function AdminSubjectForm({ subject, categories }: Props) {
    const { t } = useTranslation();
    const isEditing = subject !== null;
    const { data, setData, post, put, processing, errors } = useForm<SubjectForm>({
        teaching_category_id: subject?.teaching_category_id ?? categories[0]?.id ?? null,
        name: subject?.name ?? '',
        slug: subject?.slug ?? '',
        description: subject?.description ?? '',
        is_active: subject?.is_active ?? true,
        sort_order: subject?.sort_order ?? 0,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isEditing) {
            put(`/admin/subjects/${subject.id}`);

            return;
        }

        post('/admin/subjects');
    };

    return (
        <>
            <Head title={isEditing ? t('admin_subjects.edit_title') : t('admin_subjects.create_title')} />
            <form onSubmit={submit} className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <BookOpenCheck className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">
                                {isEditing ? t('admin_subjects.edit_title') : t('admin_subjects.create_title')}
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                                {t('admin_subjects.form_intro')}
                            </p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
                    <div className="space-y-2">
                        <Label htmlFor="category">{t('admin_subjects.category')}</Label>
                        <Select
                            value={data.teaching_category_id ? String(data.teaching_category_id) : ''}
                            onValueChange={(value) => setData('teaching_category_id', Number(value))}
                        >
                            <SelectTrigger id="category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.teaching_category_id} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">{t('admin_subjects.name')}</Label>
                        <Input id="name" value={data.name} onChange={(event) => setData('name', event.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">{t('admin_subjects.slug')}</Label>
                        <Input id="slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} />
                        <InputError message={errors.slug} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sort_order">{t('admin_subjects.sort_order')}</Label>
                        <Input
                            id="sort_order"
                            type="number"
                            min="0"
                            value={data.sort_order}
                            onChange={(event) => setData('sort_order', Number(event.target.value))}
                        />
                        <InputError message={errors.sort_order} />
                    </div>
                    <label className="flex items-center gap-3 text-sm font-medium">
                        <Checkbox checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked === true)} />
                        {t('admin_subjects.active')}
                    </label>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="description">{t('admin_subjects.description')}</Label>
                        <Textarea id="description" value={data.description} onChange={(event) => setData('description', event.target.value)} />
                        <InputError message={errors.description} />
                    </div>
                </section>

                <ContextualHelp title={t('admin_subjects.help_title')}>
                    {t('admin_subjects.help_body')}
                </ContextualHelp>

                <div className="flex gap-3">
                    <Button disabled={processing}>
                        <Save />
                        {t('actions.save')}
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/admin/subjects">{t('actions.cancel')}</Link>
                    </Button>
                </div>
            </form>
        </>
    );
}

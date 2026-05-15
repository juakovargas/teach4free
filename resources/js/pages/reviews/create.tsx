import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Star } from 'lucide-react';
import type { FormEvent } from 'react';

import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Session = {
    id: number;
    title: string;
    starts_at: string | null;
    ends_at: string | null;
    timezone: string;
    offer: { title: string; slug: string } | null;
    teacher: { id: number; name: string; avatar?: string | null };
};

type Props = {
    session: Session;
};

export default function ReviewCreate({ session }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const form = useForm({
        rating: 5,
        title: '',
        comment: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(`/my-sessions/${session.id}/review`);
    };

    return (
        <>
            <Head title={t('reviews.create_meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <Button variant="outline" asChild>
                    <Link href="/my-sessions">
                        <ArrowLeft />
                        {t('reviews.back_to_sessions')}
                    </Link>
                </Button>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Star className="mt-1 size-6 fill-current text-amber-500" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('reviews.create_title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('reviews.create_intro')}</p>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <form onSubmit={submit} className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-muted-foreground dark:border-slate-800 dark:bg-slate-950">
                            {t('reviews.responsible_review_warning')}
                        </div>

                        <div className="grid gap-2">
                            <Label>{t('reviews.rating')}</Label>
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('reviews.rating')}>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <Button
                                        key={rating}
                                        type="button"
                                        variant={form.data.rating === rating ? 'default' : 'outline'}
                                        onClick={() => form.setData('rating', rating)}
                                        aria-pressed={form.data.rating === rating}
                                    >
                                        <Star className={rating <= form.data.rating ? 'fill-current' : ''} />
                                        {rating}
                                    </Button>
                                ))}
                            </div>
                            <InputError message={form.errors.rating} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('reviews.title_label')}</Label>
                            <Input id="title" value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} />
                            <InputError message={form.errors.title} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="comment">{t('reviews.comment_label')}</Label>
                            <Textarea id="comment" rows={7} value={form.data.comment} onChange={(event) => form.setData('comment', event.target.value)} />
                            <p className="text-xs text-muted-foreground">{t('reviews.low_rating_comment_help')}</p>
                            <InputError message={form.errors.comment} />
                        </div>

                        <Button disabled={form.processing}>
                            <Star />
                            {t('reviews.submit_review')}
                        </Button>
                    </form>

                    <aside className="space-y-4">
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('reviews.session_context')}</h2>
                            <p className="mt-3 text-sm font-medium">{session.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {session.starts_at ? new Date(session.starts_at).toLocaleString() : '-'} / {session.timezone}
                            </p>
                            {session.offer && (
                                <Link href={`/offers/${session.offer.slug}`} className="mt-3 inline-block text-sm text-emerald-700 hover:underline dark:text-emerald-300">
                                    {session.offer.title}
                                </Link>
                            )}
                        </section>
                        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('sessions.teacher')}</h2>
                            <div className="mt-3 flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarImage src={session.teacher.avatar ?? undefined} alt={session.teacher.name} />
                                    <AvatarFallback>{getInitials(session.teacher.name)}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium">{session.teacher.name}</p>
                            </div>
                        </section>
                    </aside>
                </section>

                <ContextualHelp title={t('reviews.form_help_title')}>
                    {t('reviews.form_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

ReviewCreate.layout = {
    breadcrumbs: [
        {
            title: 'navigation.my_sessions',
            href: '/my-sessions',
        },
        {
            title: 'reviews.leave_review',
            href: '#',
        },
    ],
};

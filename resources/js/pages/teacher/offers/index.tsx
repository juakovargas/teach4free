import { Head, Link, usePage } from '@inertiajs/react';
import { Edit, FileText, Plus, Power, PauseCircle, PlayCircle } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Offer = {
    id: number;
    slug: string;
    title: string;
    level: string;
    teaching_mode: string;
    session_type: string;
    is_active: boolean;
    is_public: boolean;
    is_accepting_applications: boolean;
    published_at: string | null;
    category: { name: string; color: string | null };
    subject: { name: string } | null;
    languages: { code: string; name: string }[];
};

type Props = {
    teacherReady: boolean;
    teachingLanguagesCount: number;
    offers: Offer[];
};

export default function TeacherOffers({ teacherReady, teachingLanguagesCount, offers }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;

    return (
        <>
            <Head title={t('teacher_offers.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <FileText className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('teacher_offers.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('teacher_offers.intro')}</p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href="/teacher/offers/create">
                            <Plus />
                            {t('teacher_offers.create')}
                        </Link>
                    </Button>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                {!teacherReady && (
                    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                        <p className="font-semibold">{t('teacher_offers.teacher_not_ready_title')}</p>
                        <p className="mt-2">{t('teacher_offers.teacher_not_ready_body')}</p>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/profile/teacher">{t('teacher_offers.activate_teacher_link')}</Link>
                        </Button>
                    </section>
                )}

                {teacherReady && teachingLanguagesCount === 0 && (
                    <section className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                        <p className="font-semibold">{t('teacher_offers.no_teaching_languages_title')}</p>
                        <p className="mt-2">{t('teacher_offers.no_teaching_languages_body')}</p>
                        <Button className="mt-4" variant="outline" asChild>
                            <Link href="/profile/preferences">{t('teacher_offers.edit_languages_link')}</Link>
                        </Button>
                    </section>
                )}

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('teacher_offers.offer')}</th>
                                    <th className="px-4 py-3">{t('teacher_offers.category')}</th>
                                    <th className="px-4 py-3">{t('teacher_offers.languages')}</th>
                                    <th className="px-4 py-3">{t('teacher_offers.mode')}</th>
                                    <th className="px-4 py-3">{t('teacher_offers.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('teacher_offers.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            {t('teacher_offers.empty')}
                                        </td>
                                    </tr>
                                )}
                                {offers.map((offer) => (
                                    <tr key={offer.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium">{offer.title}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {t(`offer_levels.${offer.level}`)} · {t(`session_types.${offer.session_type}`)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="size-3 rounded-full" style={{ backgroundColor: offer.category.color ?? '#0f766e' }} />
                                                {offer.category.name}
                                            </div>
                                            {offer.subject && <p className="mt-1 text-xs text-muted-foreground">{offer.subject.name}</p>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {offer.languages.map((language) => (
                                                    <Badge key={language.code} variant="outline">{language.name}</Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">{t(`learning_modes.${offer.teaching_mode}`)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant={offer.is_active ? 'default' : 'outline'}>{t(offer.is_active ? 'statuses.active' : 'statuses.inactive')}</Badge>
                                                <Badge variant={offer.is_public ? 'default' : 'outline'}>{t(offer.is_public ? 'statuses.public' : 'statuses.private')}</Badge>
                                                <Badge variant={offer.is_accepting_applications ? 'default' : 'outline'}>
                                                    {t(offer.is_accepting_applications ? 'statuses.accepting' : 'statuses.paused')}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/teacher/offers/${offer.slug}/edit`}>
                                                        <Edit />
                                                        {t('actions.edit')}
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link
                                                        href={`/teacher/offers/${offer.slug}/${offer.is_public && offer.is_active ? 'unpublish' : 'publish'}`}
                                                        method="post"
                                                        as="button"
                                                        preserveScroll
                                                    >
                                                        <Power />
                                                        {offer.is_public && offer.is_active ? t('actions.unpublish') : t('actions.publish')}
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link
                                                        href={`/teacher/offers/${offer.slug}/${offer.is_accepting_applications ? 'pause-applications' : 'resume-applications'}`}
                                                        method="post"
                                                        as="button"
                                                        preserveScroll
                                                    >
                                                        {offer.is_accepting_applications ? <PauseCircle /> : <PlayCircle />}
                                                        {offer.is_accepting_applications ? t('actions.pause') : t('actions.resume')}
                                                    </Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ContextualHelp title={t('teacher_offers.help_title')}>
                    {t('teacher_offers.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

TeacherOffers.layout = {
    breadcrumbs: [
        {
            title: 'navigation.teaching_offers',
            href: '/teacher/offers',
        },
    ],
};

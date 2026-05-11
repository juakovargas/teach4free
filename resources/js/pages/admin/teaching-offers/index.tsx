import { Head, Link, usePage } from '@inertiajs/react';
import { Eye, FileText, Power } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
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
    user: { name: string; email: string; avatar?: string | null };
    category: { name: string; color: string | null };
    subject: { name: string } | null;
    languages: { code: string; name: string }[];
};

type Props = {
    offers: Offer[];
};

export default function AdminTeachingOffers({ offers }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const { flash } = usePage().props;

    return (
        <>
            <Head title={t('admin_teaching_offers.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <FileText className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_teaching_offers.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_teaching_offers.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_teaching_offers.offer')}</th>
                                    <th className="px-4 py-3">{t('admin_teaching_offers.teacher')}</th>
                                    <th className="px-4 py-3">{t('admin_teaching_offers.category')}</th>
                                    <th className="px-4 py-3">{t('admin_teaching_offers.languages')}</th>
                                    <th className="px-4 py-3">{t('admin_teaching_offers.status')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_teaching_offers.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
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
                                                <Avatar className="size-8">
                                                    <AvatarImage src={offer.user.avatar ?? undefined} alt={offer.user.name} />
                                                    <AvatarFallback>{getInitials(offer.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{offer.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{offer.user.email}</p>
                                                </div>
                                            </div>
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
                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                <Badge variant={offer.is_active ? 'default' : 'outline'}>
                                                    {t(offer.is_active ? 'statuses.active' : 'statuses.inactive')}
                                                </Badge>
                                                <Badge variant={offer.is_public ? 'default' : 'outline'}>
                                                    {t(offer.is_public ? 'statuses.public' : 'statuses.private')}
                                                </Badge>
                                                <Badge variant={offer.is_accepting_applications ? 'default' : 'outline'}>
                                                    {t(offer.is_accepting_applications ? 'statuses.accepting' : 'statuses.paused')}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/teaching-offers/${offer.slug}`}>
                                                        <Eye />
                                                        {t('actions.view')}
                                                    </Link>
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/admin/teaching-offers/${offer.slug}/toggle-active`} method="patch" as="button" preserveScroll>
                                                        <Power />
                                                        {offer.is_active ? t('actions.deactivate') : t('actions.activate')}
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

                <ContextualHelp title={t('admin_teaching_offers.help_title')}>
                    {t('admin_teaching_offers.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

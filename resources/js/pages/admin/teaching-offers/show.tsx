import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Power } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Offer = {
    slug: string;
    title: string;
    summary: string;
    description: string;
    level: string;
    teaching_mode: string;
    session_type: string;
    max_students: number | null;
    duration_minutes: number;
    meeting_tool: string;
    timezone: string;
    availability_summary: string | null;
    requirements: string | null;
    materials_summary: string | null;
    is_active: boolean;
    is_public: boolean;
    is_accepting_applications: boolean;
    published_at: string | null;
    user: { name: string; email: string };
    category: { name: string };
    subject: { name: string } | null;
    languages: { code: string; name: string }[];
};

type Props = {
    offer: Offer;
};

export default function AdminTeachingOfferShow({ offer }: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={offer.title} />
            <div className="space-y-6 p-4 sm:p-6">
                <Button variant="outline" asChild>
                    <Link href="/admin/teaching-offers">
                        <ArrowLeft />
                        {t('actions.back')}
                    </Link>
                </Button>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4">
                            <FileText className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                            <div>
                                <h1 className="text-2xl font-semibold tracking-normal">{offer.title}</h1>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{offer.summary}</p>
                            </div>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/teaching-offers/${offer.slug}/toggle-active`} method="patch" as="button" preserveScroll>
                                <Power />
                                {offer.is_active ? t('actions.deactivate') : t('actions.activate')}
                            </Link>
                        </Button>
                    </div>
                </section>

                <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
                    <Info label={t('admin_teaching_offers.teacher')} value={`${offer.user.name} (${offer.user.email})`} />
                    <Info label={t('admin_teaching_offers.category')} value={offer.category.name} />
                    <Info label={t('admin_teaching_offers.subject')} value={offer.subject?.name ?? t('common.none')} />
                    <Info label={t('admin_teaching_offers.level')} value={t(`offer_levels.${offer.level}`)} />
                    <Info label={t('admin_teaching_offers.mode')} value={t(`learning_modes.${offer.teaching_mode}`)} />
                    <Info label={t('admin_teaching_offers.session_type')} value={t(`session_types.${offer.session_type}`)} />
                    <Info label={t('admin_teaching_offers.duration')} value={t('offers.duration_value', { minutes: offer.duration_minutes })} />
                    <Info label={t('admin_teaching_offers.max_students')} value={offer.max_students ? String(offer.max_students) : t('common.not_applicable')} />
                    <Info label={t('admin_teaching_offers.timezone')} value={offer.timezone} />
                    <div className="md:col-span-3">
                        <p className="text-sm font-medium">{t('admin_teaching_offers.languages')}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {offer.languages.map((language) => (
                                <Badge key={language.code} variant="outline">{language.name}</Badge>
                            ))}
                        </div>
                    </div>
                    <Info label={t('admin_teaching_offers.active')} value={t(offer.is_active ? 'statuses.active' : 'statuses.inactive')} />
                    <Info label={t('admin_teaching_offers.public')} value={t(offer.is_public ? 'statuses.public' : 'statuses.private')} />
                    <Info label={t('admin_teaching_offers.accepting')} value={t(offer.is_accepting_applications ? 'statuses.accepting' : 'statuses.paused')} />
                </section>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p>{offer.description}</p>
                    </div>
                </section>

                <ContextualHelp title={t('admin_teaching_offers.help_title')}>
                    {t('admin_teaching_offers.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-medium">{value}</p>
        </div>
    );
}

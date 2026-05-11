import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarClock, Clock, ExternalLink, GraduationCap, Languages, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import type { ComponentType } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Offer = {
    id: number;
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
    is_accepting_applications: boolean;
    user: { name: string; bio?: string | null; avatar?: string | null };
    category: { name: string; color: string | null };
    subject: { name: string } | null;
    languages: { id: number; code: string; name: string }[];
};

type SeatSummary = {
    accepted_count: number;
    waitlisted_count: number;
    available_seats: number | null;
    allow_waiting_list: boolean;
    waiting_list_limit: number | null;
};

type CurrentApplication = {
    id: number;
    status: string;
};

type ApplicationForm = {
    message: string;
    preferred_language_id: string;
    availability_note: string;
    application?: string;
};

type Props = {
    offer: Offer;
    seatSummary: SeatSummary;
    currentApplication: CurrentApplication | null;
    isOwnOffer: boolean;
    visibleMeetingUrl: string | null;
};

export default function PublicOfferShow({ offer, seatSummary, currentApplication, isOwnOffer, visibleMeetingUrl }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();
    const { auth } = usePage().props;
    const { data, setData, post, processing, errors } = useForm<ApplicationForm>({
        message: '',
        preferred_language_id: offer.languages.length === 1 ? String(offer.languages[0].id) : '',
        availability_note: '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post(`/offers/${offer.slug}/apply`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={offer.title} />
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                <Button variant="outline" asChild>
                    <Link href="/offers">
                        <ArrowLeft />
                        {t('offers.back_to_search')}
                    </Link>
                </Button>

                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="mb-4 flex flex-wrap gap-2">
                                <Badge variant="outline">{offer.category.name}</Badge>
                                {offer.subject && <Badge variant="outline">{offer.subject.name}</Badge>}
                                <Badge>{t('offers.free_badge')}</Badge>
                            </div>
                            <h1 className="max-w-4xl text-3xl font-semibold tracking-normal sm:text-4xl">{offer.title}</h1>
                            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{offer.summary}</p>
                        </div>
                        <div className="flex min-w-64 items-center gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                            <Avatar className="size-12">
                                <AvatarImage src={offer.user.avatar ?? undefined} alt={offer.user.name} />
                                <AvatarFallback>{getInitials(offer.user.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('offers.teacher')}</p>
                                <p className="font-semibold">{offer.user.name}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <Info icon={GraduationCap} label={t('offers.level')} value={t(`offer_levels.${offer.level}`)} />
                    <Info icon={Users} label={t('offers.mode')} value={t(`learning_modes.${offer.teaching_mode}`)} />
                    <Info icon={CalendarClock} label={t('offers.session_type')} value={t(`session_types.${offer.session_type}`)} />
                    <Info icon={Clock} label={t('offers.duration')} value={t('offers.duration_value', { minutes: offer.duration_minutes })} />
                    <Info icon={Users} label={t('offers.max_students')} value={offer.max_students ? String(offer.max_students) : t('common.not_applicable')} />
                    <Info icon={Languages} label={t('offers.languages')} value={offer.languages.map((language) => language.name).join(', ')} />
                </section>

                <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="text-lg font-semibold">{t('offers.description')}</h2>
                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">{offer.description}</p>
                        {offer.requirements && (
                            <>
                                <h3 className="mt-6 font-semibold">{t('offers.requirements')}</h3>
                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{offer.requirements}</p>
                            </>
                        )}
                        {offer.materials_summary && (
                            <>
                                <h3 className="mt-6 font-semibold">{t('offers.materials')}</h3>
                                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">{offer.materials_summary}</p>
                            </>
                        )}
                    </article>

                    <aside className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="font-semibold">{t('offers.join_title')}</h2>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t('offers.free_application_note')}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {t('offers.external_meeting_note')}
                            </p>
                            <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-950">
                                <p className="font-medium">
                                    {seatSummary.available_seats === null
                                        ? t('applications.no_strict_seat_limit')
                                        : t('applications.available_seats', { count: seatSummary.available_seats })}
                                </p>
                                <p className="text-muted-foreground">
                                    {seatSummary.allow_waiting_list
                                        ? t('applications.waiting_list_available', { count: seatSummary.waitlisted_count })
                                        : t('applications.waiting_list_closed')}
                                </p>
                            </div>
                            {!auth.user && (
                                <div className="mt-4 space-y-3">
                                    <p className="text-sm text-muted-foreground">{t('applications.login_required')}</p>
                                    <div className="flex gap-2">
                                        <Button asChild>
                                            <Link href="/login">{t('navigation.login')}</Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href="/register">{t('navigation.register')}</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {auth.user && !auth.user.email_verified_at && (
                                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
                                    <p>{t('applications.verify_email_required')}</p>
                                    <Button className="mt-3" variant="outline" asChild>
                                        <Link href="/email/verify">{t('auth.verify.button')}</Link>
                                    </Button>
                                </div>
                            )}
                            {auth.user && isOwnOffer && (
                                <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                                    <p>{t('applications.own_offer_message')}</p>
                                    <Button className="mt-3" variant="outline" asChild>
                                        <Link href={`/teacher/offers/${offer.slug}/edit`}>{t('applications.manage_own_offer')}</Link>
                                    </Button>
                                </div>
                            )}
                            {auth.user && currentApplication && (
                                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                                    <p>{t('applications.current_status', { status: t(`application_statuses.${currentApplication.status}`) })}</p>
                                </div>
                            )}
                            {visibleMeetingUrl && (
                                <Button className="mt-4 w-full" asChild>
                                    <a href={visibleMeetingUrl} target="_blank" rel="noreferrer">
                                        <ExternalLink />
                                        {t('offers.open_external_meeting')}
                                    </a>
                                </Button>
                            )}
                            {auth.user && auth.user.email_verified_at && !isOwnOffer && !currentApplication && offer.is_accepting_applications && (
                                <form onSubmit={submit} className="mt-5 space-y-4">
                                    {offer.languages.length > 1 && (
                                        <div className="space-y-2">
                                            <Label>{t('applications.preferred_language')}</Label>
                                            <Select value={data.preferred_language_id} onValueChange={(value) => setData('preferred_language_id', value)}>
                                                <SelectTrigger><SelectValue placeholder={t('applications.choose_language')} /></SelectTrigger>
                                                <SelectContent>
                                                    {offer.languages.map((language) => (
                                                        <SelectItem key={language.id} value={String(language.id)}>{language.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.preferred_language_id} />
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="message">{t('applications.message')}</Label>
                                        <Textarea id="message" value={data.message} onChange={(event) => setData('message', event.target.value)} />
                                        <InputError message={errors.message} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="availability_note">{t('applications.availability_note')}</Label>
                                        <Textarea id="availability_note" value={data.availability_note} onChange={(event) => setData('availability_note', event.target.value)} />
                                        <InputError message={errors.availability_note} />
                                    </div>
                                    <InputError message={errors.application} />
                                    <Button className="w-full" disabled={processing}>
                                        {offer.session_type === 'open_public' ? t('applications.join_open_class') : t('applications.apply_free')}
                                    </Button>
                                </form>
                            )}
                            {auth.user && !currentApplication && !offer.is_accepting_applications && (
                                <p className="mt-4 rounded-lg border border-slate-200 p-3 text-sm text-muted-foreground dark:border-slate-800">
                                    {t('applications.not_accepting')}
                                </p>
                            )}
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <p className="font-semibold">{t('offers.meeting_tool')}</p>
                            <p className="mt-1 text-muted-foreground">{t(`meeting_tools.${offer.meeting_tool}`)}</p>
                            <p className="mt-4 font-semibold">{t('offers.timezone')}</p>
                            <p className="mt-1 text-muted-foreground">{offer.timezone}</p>
                            {offer.availability_summary && (
                                <>
                                    <p className="mt-4 font-semibold">{t('offers.availability')}</p>
                                    <p className="mt-1 text-muted-foreground">{offer.availability_summary}</p>
                                </>
                            )}
                        </div>
                        <Button variant="outline" className="w-full" asChild>
                            <Link href={`/support/report?type=teaching_offer&teaching_offer_id=${offer.id}`}>
                                {t('offers.report_offer')}
                            </Link>
                        </Button>
                    </aside>
                </section>

                <ContextualHelp title={t('offers.detail_help_title')}>
                    {t('offers.detail_help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Info({
    icon: Icon,
    label,
    value,
}: {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <Icon className="mb-3 size-5 text-emerald-700 dark:text-emerald-300" />
            <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
    );
}

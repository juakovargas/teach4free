import { Head, Link } from '@inertiajs/react';
import { Inbox } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';

type Application = {
    id: number;
    status: string;
    requested_at: string | null;
    accepted_at: string | null;
    rejected_at: string | null;
    cancelled_at: string | null;
    student: { name: string; email: string; avatar?: string | null };
    teacher: { name: string; email: string; avatar?: string | null };
    offer: {
        title: string;
        slug: string;
        category: { name: string } | null;
        subject: { name: string } | null;
    };
};

type Props = {
    applications: Application[];
};

export default function AdminApplications({ applications }: Props) {
    const { t } = useTranslation();
    const getInitials = useInitials();

    return (
        <>
            <Head title={t('admin_applications.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <Inbox className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('admin_applications.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('admin_applications.intro')}</p>
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-950">
                                <tr>
                                    <th className="px-4 py-3">{t('admin_applications.offer')}</th>
                                    <th className="px-4 py-3">{t('admin_applications.teacher')}</th>
                                    <th className="px-4 py-3">{t('admin_applications.student')}</th>
                                    <th className="px-4 py-3">{t('admin_applications.status')}</th>
                                    <th className="px-4 py-3">{t('admin_applications.requested_at')}</th>
                                    <th className="px-4 py-3 text-right">{t('admin_applications.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                            {t('admin_applications.empty')}
                                        </td>
                                    </tr>
                                )}
                                {applications.map((application) => (
                                    <tr key={application.id} className="border-b last:border-0">
                                        <td className="px-4 py-4">
                                            <p className="font-medium">{application.offer.title}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {application.offer.category?.name}
                                                {application.offer.subject ? ` / ${application.offer.subject.name}` : ''}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Person user={application.teacher} getInitials={getInitials} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <Person user={application.student} getInitials={getInitials} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge>{t(`application_statuses.${application.status}`)}</Badge>
                                        </td>
                                        <td className="px-4 py-4">{application.requested_at ? new Date(application.requested_at).toLocaleString() : '-'}</td>
                                        <td className="px-4 py-4 text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/offers/${application.offer.slug}`}>{t('actions.view')}</Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <ContextualHelp title={t('admin_applications.help_title')}>
                    {t('admin_applications.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

function Person({
    user,
    getInitials,
}: {
    user: { name: string; email: string; avatar?: string | null };
    getInitials: (name: string) => string;
}) {
    return (
        <div className="flex items-center gap-3">
            <Avatar className="size-9">
                <AvatarImage src={user.avatar ?? undefined} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
        </div>
    );
}

AdminApplications.layout = {
    breadcrumbs: [
        {
            title: 'admin_sections.applications',
            href: '/admin/applications',
        },
    ],
};

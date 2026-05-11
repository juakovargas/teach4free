import { Head, Link, usePage } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type NotificationItem = {
    id: string;
    title: string;
    message: string;
    action_url?: string | null;
    read_at?: string | null;
    created_at?: string | null;
};

type Props = {
    notifications: NotificationItem[];
};

export default function NotificationsIndex({ notifications }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const unreadCount = notifications.filter((notification) => !notification.read_at).length;

    return (
        <>
            <Head title={t('notifications.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <Bell className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('notifications.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('notifications.intro')}</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button variant="outline" asChild>
                            <Link href="/notifications/read-all" method="patch" as="button">
                                <CheckCheck />
                                {t('notifications.mark_all_read')}
                            </Link>
                        </Button>
                    )}
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <section className="grid gap-3">
                    {notifications.length === 0 && (
                        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-muted-foreground shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {t('notifications.empty')}
                        </div>
                    )}
                    {notifications.map((notification) => (
                        <article key={notification.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-semibold">{notification.title}</h2>
                                        {!notification.read_at && <Badge>{t('notifications.unread')}</Badge>}
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{notification.message}</p>
                                    {notification.created_at && (
                                        <p className="mt-2 text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString()}</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {notification.action_url && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={notification.action_url}>{t('notifications.open_action')}</Link>
                                        </Button>
                                    )}
                                    {!notification.read_at && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/notifications/${notification.id}/read`} method="patch" as="button" preserveScroll>
                                                {t('notifications.mark_read')}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                <ContextualHelp title={t('notifications.help_title')}>
                    {t('notifications.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

NotificationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'navigation.notifications',
            href: '/notifications',
        },
    ],
};

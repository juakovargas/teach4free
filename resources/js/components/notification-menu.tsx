import { Link, usePage } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/use-translation';

type NotificationPreview = {
    id: string;
    title: string;
    message: string;
    action_url?: string | null;
    read_at?: string | null;
    created_at?: string | null;
};

type NotificationState = {
    unread_count: number;
    latest: NotificationPreview[];
};

export function NotificationMenu() {
    const { t } = useTranslation();
    const notifications = usePage().props.notifications as NotificationState | undefined;
    const unreadCount = notifications?.unread_count ?? 0;
    const latest = notifications?.latest ?? [];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-full"
                    aria-label={t('notifications.open_menu')}
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-[11px] font-semibold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex items-center justify-between gap-2">
                    <span>{t('notifications.title')}</span>
                    {unreadCount > 0 && (
                        <Link
                            href="/notifications/read-all"
                            method="patch"
                            as="button"
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
                        >
                            <CheckCheck className="size-3" />
                            {t('notifications.mark_all_read')}
                        </Link>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {latest.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                        {t('notifications.empty')}
                    </div>
                )}
                {latest.map((notification) => (
                    <DropdownMenuItem key={notification.id} asChild>
                        <Link
                            href={notification.action_url ?? '/notifications'}
                            className="flex cursor-pointer flex-col items-start gap-1 whitespace-normal py-3"
                        >
                            <span className="text-sm font-semibold">{notification.title}</span>
                            <span className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/notifications" className="cursor-pointer justify-center font-medium">
                        {t('notifications.view_all')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

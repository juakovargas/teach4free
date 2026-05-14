import { Link, usePage } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type MessageState = {
    unread_count: number;
};

export function MessageMenu() {
    const { t } = useTranslation();
    const messages = usePage().props.messages as MessageState | undefined;
    const unreadCount = messages?.unread_count ?? 0;

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full"
            aria-label={t('messages.open_inbox')}
            asChild
        >
            <Link href="/messages">
                <MessageCircle className="size-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1.5 text-[11px] font-semibold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </Link>
        </Button>
    );
}

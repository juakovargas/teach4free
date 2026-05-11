import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

type Props = {
    user: User;
    showName?: boolean;
    className?: string;
};

export function UserDropdown({ user, showName = true, className }: Props) {
    const getInitials = useInitials();
    const { t } = useTranslation();
    const displayName = user.name || user.email;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn('h-10 gap-2 rounded-full px-2', className)}
                    aria-label={t('navigation.user_menu')}
                    data-testid="user-dropdown-trigger"
                >
                    <Avatar className="size-8 overflow-hidden rounded-full">
                        <AvatarImage
                            src={user.avatar ?? undefined}
                            alt={displayName}
                        />
                        <AvatarFallback className="rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-50">
                            {getInitials(displayName)}
                        </AvatarFallback>
                    </Avatar>
                    {showName && (
                        <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                            {displayName}
                        </span>
                    )}
                    <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <UserMenuContent user={user} />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

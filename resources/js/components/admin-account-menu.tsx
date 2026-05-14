import { Link, router, usePage } from '@inertiajs/react';
import { ChevronDown, Cookie, LayoutDashboard, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInitials } from '@/hooks/use-initials';
import { useTranslation } from '@/hooks/use-translation';
import { openCookiePreferences } from '@/lib/cookie-consent';
import { logout } from '@/routes';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export function AdminAccountMenu() {
    const { auth } = usePage().props as PageProps;
    const { t } = useTranslation();
    const getInitials = useInitials();
    const user = auth.user;

    if (!user) {
        return null;
    }

    const displayName = user.name || user.email;
    const initials = user.initials ?? getInitials(displayName);

    const handleLogout = () => {
        router.flushAll();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="h-10 gap-2 rounded-full px-2"
                    aria-label={t('admin_account.open_menu')}
                >
                    <Avatar className="size-8 overflow-hidden rounded-full">
                        <AvatarImage src={user.avatar ?? undefined} alt={displayName} />
                        <AvatarFallback className="rounded-full bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
                        {displayName}
                    </span>
                    <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>
                    <div className="grid gap-1">
                        <span className="truncate text-sm font-medium">{displayName}</span>
                        <span className="truncate text-xs font-normal text-muted-foreground">
                            {user.email}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile/preferences" className="block w-full cursor-pointer">
                        <Settings className="mr-2" />
                        {t('navigation.preferences')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/admin" className="block w-full cursor-pointer">
                        <ShieldCheck className="mr-2" />
                        {t('admin_account.admin_dashboard')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="block w-full cursor-pointer">
                        <LayoutDashboard className="mr-2" />
                        {t('admin_account.user_dashboard')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={openCookiePreferences}>
                    <Cookie className="mr-2" />
                    {t('cookie_consent.cookie_preferences')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link
                        href={logout()}
                        as="button"
                        className="block w-full cursor-pointer"
                        onClick={handleLogout}
                    >
                        <LogOut className="mr-2" />
                        {t('navigation.logout')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

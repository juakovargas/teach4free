import { Link, router } from '@inertiajs/react';
import {
    Award,
    BookOpenCheck,
    CalendarClock,
    CalendarDays,
    Cookie,
    FileText,
    Inbox,
    Languages,
    LogOut,
    Presentation,
    Settings,
    ShieldAlert,
    Shield,
    Star,
} from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useTranslation } from '@/hooks/use-translation';
import { openCookiePreferences } from '@/lib/cookie-consent';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { t } = useTranslation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/profile/preferences"
                        prefetch
                        onClick={cleanup}
                    >
                        <Languages className="mr-2" />
                        {t('navigation.preferences')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/profile/student"
                        prefetch
                        onClick={cleanup}
                    >
                        <BookOpenCheck className="mr-2" />
                        {t('navigation.learning_profile')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/profile/teacher"
                        prefetch
                        onClick={cleanup}
                    >
                        <Presentation className="mr-2" />
                        {t('navigation.teacher_profile')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/my-applications"
                        prefetch
                        onClick={cleanup}
                    >
                        <Inbox className="mr-2" />
                        {t('navigation.my_applications')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/my-sessions"
                        prefetch
                        onClick={cleanup}
                    >
                        <CalendarDays className="mr-2" />
                        {t('navigation.my_sessions')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/teacher/offers"
                        prefetch
                        onClick={cleanup}
                    >
                        <FileText className="mr-2" />
                        {t('navigation.my_teaching_offers')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/teacher/availability"
                        prefetch
                        onClick={cleanup}
                    >
                        <CalendarClock className="mr-2" />
                        {t('navigation.my_availability')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/teacher/applications"
                        prefetch
                        onClick={cleanup}
                    >
                        <Presentation className="mr-2" />
                        {t('navigation.requests_to_my_offers')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/teacher/sessions"
                        prefetch
                        onClick={cleanup}
                    >
                        <CalendarDays className="mr-2" />
                        {t('navigation.teacher_sessions')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/teacher/reviews"
                        prefetch
                        onClick={cleanup}
                    >
                        <Star className="mr-2" />
                        {t('navigation.teacher_reviews')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/profile/teacher/badges"
                        prefetch
                        onClick={cleanup}
                    >
                        <Award className="mr-2" />
                        {t('navigation.teacher_badges')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/profile/notification-preferences"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        {t('navigation.notification_preferences')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/my-reports"
                        prefetch
                        onClick={cleanup}
                    >
                        <ShieldAlert className="mr-2" />
                        {t('navigation.my_reports')}
                    </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href="/admin"
                            prefetch
                            onClick={cleanup}
                        >
                            <Shield className="mr-2" />
                            {t('navigation.admin')}
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        {t('navigation.settings')}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                        cleanup();
                        openCookiePreferences();
                    }}
                >
                    <Cookie className="mr-2" />
                    {t('cookie_consent.cookie_preferences')}
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    {t('navigation.logout')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}

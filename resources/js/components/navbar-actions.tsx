import { Link, usePage } from '@inertiajs/react';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { NotificationMenu } from '@/components/notification-menu';
import { Button } from '@/components/ui/button';
import { UserDropdown } from '@/components/user-dropdown';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';
import type { Auth } from '@/types';

type Props = {
    canRegister?: boolean;
    className?: string;
    showGuestLinks?: boolean;
    showNotifications?: boolean;
    showUserName?: boolean;
};

type PageProps = {
    auth: Auth;
    canRegister?: boolean;
};

export function NavbarActions({
    canRegister,
    className,
    showGuestLinks = false,
    showNotifications = true,
    showUserName = true,
}: Props) {
    const pageProps = usePage().props as PageProps;
    const { t } = useTranslation();
    const user = pageProps.auth.user;
    const registrationEnabled = canRegister ?? pageProps.canRegister ?? true;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <AppearanceToggle />
            <LanguageSelector />
            {user ? (
                <>
                    {showNotifications && <NotificationMenu />}
                    <UserDropdown user={user} showName={showUserName} />
                </>
            ) : (
                showGuestLinks && (
                    <>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={login()}>{t('navigation.login')}</Link>
                        </Button>
                        {registrationEnabled && (
                            <Button size="sm" asChild>
                                <Link href={register()}>
                                    {t('navigation.register')}
                                </Link>
                            </Button>
                        )}
                    </>
                )
            )}
        </div>
    );
}

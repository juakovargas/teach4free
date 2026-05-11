import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogo from '@/components/app-logo';
import { NavbarActions } from '@/components/navbar-actions';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard, register } from '@/routes';
import type { Auth } from '@/types';

type Props = PropsWithChildren;
type PublicPageProps = {
    auth: Auth;
    canRegister?: boolean;
};

export default function PublicLayout({ children }: Props) {
    const { auth, canRegister = true } = usePage().props as PublicPageProps;
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#f8fbf8] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
            <header className="border-b border-emerald-900/10 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-slate-950/85">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-2 sm:gap-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2 [&>div:last-child]:hidden sm:[&>div:last-child]:grid"
                    >
                        <AppLogo />
                    </Link>
                    <nav className="ml-auto hidden items-center gap-1 text-sm font-medium md:flex">
                        <Button variant="ghost" asChild>
                            <Link href="/">{t('navigation.home')}</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/about">{t('navigation.about')}</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/offers">
                                {t('navigation.find_free_classes')}
                            </Link>
                        </Button>
                        {(auth.user || canRegister) && (
                            <Button variant="ghost" asChild>
                                <Link
                                    href={
                                        auth.user
                                            ? '/teacher/offers'
                                            : register()
                                    }
                                >
                                    {t('actions.start_teaching')}
                                </Link>
                            </Button>
                        )}
                        {auth.user && (
                            <Button variant="ghost" asChild>
                                <Link href={dashboard()}>
                                    {t('navigation.dashboard')}
                                </Link>
                            </Button>
                        )}
                    </nav>
                    <div className="ml-auto flex items-center gap-2 md:ml-2">
                        <NavbarActions
                            canRegister={canRegister}
                            showGuestLinks={true}
                            showNotifications={Boolean(auth.user)}
                        />
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}

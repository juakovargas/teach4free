import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import AppLogo from '@/components/app-logo';
import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard, login, register } from '@/routes';
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
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
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
                    </nav>
                    <div className="ml-auto flex items-center gap-2 md:ml-2">
                        <LanguageSelector />
                        {auth.user ? (
                            <Button asChild>
                                <Link href={dashboard()}>
                                    {t('navigation.dashboard')}
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href={login()}>
                                        {t('navigation.login')}
                                    </Link>
                                </Button>
                                {canRegister && (
                                    <Button asChild>
                                        <Link href={register()}>
                                            {t('navigation.register')}
                                        </Link>
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </header>
            <main>{children}</main>
        </div>
    );
}

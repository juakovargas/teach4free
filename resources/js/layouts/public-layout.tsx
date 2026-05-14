import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren, ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { CookiePreferencesButton } from '@/components/cookie-preferences-button';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { LanguageSelector } from '@/components/language-selector';
import { NavbarActions } from '@/components/navbar-actions';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard } from '@/routes';
import type { Auth } from '@/types';

type Props = PropsWithChildren;
type PublicPageProps = {
    auth: Auth;
    canRegister?: boolean;
};

export default function PublicLayout({ children }: Props) {
    const { auth, canRegister = true } = usePage().props as PublicPageProps;
    const { t } = useTranslation();
    const startTeachingHref = auth.user ? '/teacher/offers' : '/register';

    return (
        <div className="min-h-screen bg-[#fffaf3] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
            <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/85 shadow-xs backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85">
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
                        <Button variant="ghost" asChild>
                            <Link href="/teachers">
                                {t('navigation.browse_teachers')}
                            </Link>
                        </Button>
                        {(auth.user || canRegister) && (
                            <Button variant="ghost" asChild>
                                <Link
                                    href={
                                        startTeachingHref
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
                <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-3 pb-3 text-sm font-medium md:hidden">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">{t('navigation.home')}</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/offers">{t('navigation.find_free_classes')}</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/teachers">{t('navigation.browse_teachers')}</Link>
                    </Button>
                    {(auth.user || canRegister) && (
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={startTeachingHref}>
                                {t('actions.start_teaching')}
                            </Link>
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/about">{t('navigation.about')}</Link>
                    </Button>
                </nav>
            </header>
            <ImpersonationBanner />
            <main>{children}</main>
            <PublicFooter
                canRegister={canRegister}
                startTeachingHref={startTeachingHref}
            />
        </div>
    );
}

function PublicFooter({
    canRegister,
    startTeachingHref,
}: {
    canRegister: boolean;
    startTeachingHref: string;
}) {
    const { t } = useTranslation();

    const learnLinks = [
        { href: '/offers', label: t('footer.find_free_classes') },
        { href: '/teachers', label: t('footer.browse_teachers') },
        { href: '/offers?session_type=open_public', label: t('footer.open_public_classes') },
        { href: '/about', label: t('footer.about') },
    ];
    const teachLinks = [
        ...(canRegister
            ? [{ href: startTeachingHref, label: t('footer.start_teaching') }]
            : []),
        { href: '/teacher-guidelines', label: t('footer.teacher_guidelines') },
        { href: '/free-learning-rules', label: t('footer.free_teaching_rules') },
    ];
    const safetyLinks = [
        { href: '/support/report', label: t('footer.report_issue') },
        { href: '/terms', label: t('footer.terms') },
        { href: '/privacy', label: t('footer.privacy') },
        { href: '/cookie-policy', label: t('footer.cookie_policy') },
        { href: '/community-guidelines', label: t('footer.community_guidelines') },
    ];

    return (
        <footer className="border-t border-emerald-900/10 bg-slate-950 text-slate-200 dark:border-white/10">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr_0.8fr] lg:px-8">
                <div>
                    <Link href="/" className="inline-flex items-center gap-2">
                        <AppLogo />
                    </Link>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
                        {t('footer.mission')}
                    </p>
                    <p className="mt-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm leading-6 text-emerald-100">
                        {t('footer.free_rule')}
                    </p>
                </div>
                <FooterColumn title={t('footer.learn')} links={learnLinks} />
                <FooterColumn title={t('footer.teach')} links={teachLinks} />
                <FooterColumn title={t('footer.community_safety')} links={safetyLinks}>
                    <CookiePreferencesButton className="text-slate-300 hover:text-white" />
                </FooterColumn>
                <div>
                    <h2 className="text-sm font-semibold text-white">
                        {t('footer.language')}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        {t('footer.language_body')}
                    </p>
                    <div className="mt-4">
                        <LanguageSelector />
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({
    title,
    links,
    children,
}: {
    title: string;
    links: { href: string; label: string }[];
    children?: ReactNode;
}) {
    return (
        <nav>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            <div className="mt-3 grid gap-2">
                {links.map((link) => (
                    <Link
                        key={`${link.href}-${link.label}`}
                        href={link.href}
                        className="text-sm text-slate-300 transition hover:text-white"
                    >
                        {link.label}
                    </Link>
                ))}
                {children}
            </div>
        </nav>
    );
}

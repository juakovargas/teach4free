import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpenCheck,
    CalendarDays,
    Cookie,
    FileText,
    GitMerge,
    Globe2,
    GraduationCap,
    Languages,
    LayoutDashboard,
    Library,
    Mail,
    Map,
    MessageSquareWarning,
    MessagesSquare,
    NotebookTabs,
    Presentation,
    Scale,
    ScrollText,
    Settings,
    ShieldAlert,
    ShieldCheck,
    SlidersHorizontal,
    Star,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { PropsWithChildren } from 'react';

import { AdminAccountMenu } from '@/components/admin-account-menu';
import AppLogo from '@/components/app-logo';
import { AppearanceToggle } from '@/components/appearance-toggle';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { ConsentAwareTrackingScripts } from '@/components/consent-aware-tracking-scripts';
import { CookieConsentManager } from '@/components/cookie-consent-manager';
import { ImpersonationBanner } from '@/components/impersonation-banner';
import { LanguageSelector } from '@/components/language-selector';
import { MessageMenu } from '@/components/message-menu';
import { NotificationMenu } from '@/components/notification-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Props = PropsWithChildren<{
    breadcrumbs?: BreadcrumbItem[];
}>;

type AdminNavItem = {
    labelKey: string;
    href: string;
    icon: LucideIcon;
    badgeKey?: AdminModerationKey;
};

type AdminModerationKey = 'open_incidents' | 'open_conversation_reports' | 'open_review_reports' | 'pending_moderation' | 'reports_awaiting_response';

type AdminNavGroup = {
    labelKey: string;
    items: AdminNavItem[];
    badgeKey?: AdminModerationKey;
};

const groups: AdminNavGroup[] = [
    {
        labelKey: 'admin_sidebar.overview',
        items: [
            { labelKey: 'admin_sections.dashboard', href: '/admin', icon: LayoutDashboard },
            { labelKey: 'admin_sections.world_map', href: '/admin/world-map', icon: Map },
            { labelKey: 'admin_sections.analytics', href: '/admin/analytics', icon: TrendingUp },
            { labelKey: 'admin_sections.calendar_overview', href: '/admin/calendar-overview', icon: CalendarDays },
        ],
    },
    {
        labelKey: 'admin_sidebar.user_management',
        items: [
            { labelKey: 'admin_sections.users', href: '/admin/users', icon: Users },
            { labelKey: 'admin_sections.teachers', href: '/admin/teachers', icon: Presentation },
            { labelKey: 'admin_sections.reputation', href: '/admin/reputation', icon: ShieldCheck },
            { labelKey: 'admin_sections.students', href: '/admin/students', icon: GraduationCap },
        ],
    },
    {
        labelKey: 'admin_sidebar.learning_content',
        items: [
            { labelKey: 'admin_sections.languages', href: '/admin/languages', icon: Languages },
            { labelKey: 'admin_sections.translations', href: '/admin/translations', icon: Globe2 },
            { labelKey: 'admin_sections.categories', href: '/admin/categories', icon: Library },
            { labelKey: 'admin_sections.category_proposals', href: '/admin/category-proposals', icon: MessageSquareWarning },
            { labelKey: 'admin_sections.subjects', href: '/admin/subjects', icon: BookOpenCheck },
            { labelKey: 'admin_sections.subject_proposals', href: '/admin/subject-proposals', icon: GitMerge },
            { labelKey: 'admin_sections.teaching_offers', href: '/admin/teaching-offers', icon: FileText },
        ],
    },
    {
        labelKey: 'admin_sidebar.operations',
        items: [
            { labelKey: 'admin_sections.applications', href: '/admin/applications', icon: ScrollText },
            { labelKey: 'admin_sections.sessions', href: '/admin/sessions', icon: CalendarDays },
            { labelKey: 'admin_sections.email_log', href: '/admin/email-log', icon: Mail },
            { labelKey: 'admin_sections.audit_log', href: '/admin/audit-log', icon: NotebookTabs },
        ],
    },
    {
        labelKey: 'admin_sidebar.moderation',
        badgeKey: 'pending_moderation',
        items: [
            { labelKey: 'admin_sections.incidents', href: '/admin/incidents', icon: ShieldAlert, badgeKey: 'open_incidents' },
            { labelKey: 'admin_sections.conversations', href: '/admin/conversations', icon: MessagesSquare },
            { labelKey: 'admin_sections.conversation_reports', href: '/admin/conversation-reports', icon: MessageSquareWarning, badgeKey: 'open_conversation_reports' },
            { labelKey: 'admin_sections.reviews_moderation', href: '/admin/reviews', icon: Star, badgeKey: 'open_review_reports' },
            { labelKey: 'admin_sections.review_reports', href: '/admin/review-reports', icon: MessageSquareWarning, badgeKey: 'open_review_reports' },
        ],
    },
    {
        labelKey: 'admin_sidebar.gamification',
        items: [
            { labelKey: 'admin_sections.badges', href: '/admin/badges', icon: BadgeCheck },
            { labelKey: 'admin_sections.reputation_rules', href: '/admin/reputation-rules', icon: UserCheck },
        ],
    },
    {
        labelKey: 'admin_sidebar.content_settings',
        items: [
            { labelKey: 'admin_sections.content_pages', href: '/admin/content-pages', icon: FileText },
            { labelKey: 'admin_sections.help_pages', href: '/admin/help-pages', icon: MessageSquareWarning },
            { labelKey: 'admin_sections.platform_settings', href: '/admin/platform-settings', icon: Settings },
            { labelKey: 'admin_sections.cookie_settings', href: '/admin/cookie-settings', icon: Cookie },
            { labelKey: 'admin_sections.legal_pages', href: '/admin/legal-pages', icon: Scale },
        ],
    },
];

export default function AdminLayout({ children, breadcrumbs = [] }: Props) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
            <ConsentAwareTrackingScripts />
            <CookieConsentManager />
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
                <div className="flex h-16 items-center gap-3 px-3 sm:px-5">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t('navigation.menu')}>
                                <SlidersHorizontal className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-80 overflow-y-auto p-0">
                            <AdminSidebar />
                        </SheetContent>
                    </Sheet>
                    <Link href="/admin" className="flex min-w-0 items-center gap-2">
                        <AppLogo />
                    </Link>
                    <div className="hidden min-w-0 flex-1 md:block">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <AppearanceToggle />
                        <LanguageSelector />
                        <MessageMenu />
                        <NotificationMenu />
                        <AdminAccountMenu />
                    </div>
                </div>
            </header>
            <ImpersonationBanner />

            <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[18rem_1fr]">
                <aside className="hidden border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block">
                    <AdminSidebar />
                </aside>
                <main className="min-w-0">{children}</main>
            </div>
        </div>
    );
}

function AdminSidebar() {
    const { t } = useTranslation();
    const { props } = usePage();
    const moderation = props.admin_moderation as Record<AdminModerationKey, number> | undefined;

    return (
        <div className="flex min-h-full flex-col">
            <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <p className="text-sm font-semibold">{t('admin.sidebar_title')}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{t('admin.sidebar_intro')}</p>
            </div>
            <nav className="grid gap-5 overflow-y-auto p-4">
                {groups.map((group) => (
                    <div key={group.labelKey} className="grid gap-1.5">
                        <p className="flex items-center gap-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
                            <span>{t(group.labelKey)}</span>
                            {group.badgeKey && (moderation?.[group.badgeKey] ?? 0) > 0 && (
                                <span className="rounded-full bg-rose-600 px-1.5 py-0.5 text-[0.65rem] leading-none text-white">
                                    {(moderation?.[group.badgeKey] ?? 0) > 99 ? '99+' : moderation?.[group.badgeKey]}
                                </span>
                            )}
                        </p>
                        {group.items.map((item) => (
                            <AdminSidebarItem key={item.href} item={item} />
                        ))}
                    </div>
                ))}
            </nav>
        </div>
    );
}

function AdminSidebarItem({ item }: { item: AdminNavItem }) {
    const { t } = useTranslation();
    const { props, url } = usePage();
    const active = item.href === '/admin' ? url === '/admin' || url === '/admin/dashboard' : url.startsWith(item.href);
    const moderation = props.admin_moderation as Record<AdminModerationKey, number> | undefined;
    const badgeValue = item.badgeKey ? (moderation?.[item.badgeKey] ?? 0) : 0;

    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-white',
                active && 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
            )}
        >
            <item.icon className="size-4 shrink-0" />
            <span className="truncate">{t(item.labelKey)}</span>
            {badgeValue > 0 && (
                <span className="ml-auto min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[0.7rem] font-semibold leading-none text-white">
                    {badgeValue > 99 ? '99+' : badgeValue}
                </span>
            )}
        </Link>
    );
}

import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpenCheck,
    FileText,
    Flag,
    GraduationCap,
    Languages,
    LayoutDashboard,
    Library,
    MessageSquareWarning,
    Presentation,
    ScrollText,
    Settings,
    Star,
    Users,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: PropsWithChildren) {
    const { t } = useTranslation();
    const { url } = usePage();
    const items = [
        { label: t('admin_sections.dashboard'), href: '/admin', icon: LayoutDashboard },
        { label: t('admin_sections.users'), href: '/admin/users', icon: Users },
        { label: t('admin_sections.teachers'), href: '/admin/teachers', icon: Presentation },
        { label: t('admin_sections.students'), href: '/admin/students', icon: GraduationCap },
        { label: t('admin_sections.languages'), href: '/admin/languages', icon: Languages },
        { label: t('admin_sections.categories'), href: '/admin/categories', icon: Library },
        { label: t('admin_sections.subjects'), href: '/admin/subjects', icon: BookOpenCheck },
        { label: t('admin_sections.teaching_offers'), href: '/admin/teaching-offers', icon: FileText },
        { label: t('admin_sections.applications'), href: '/admin/applications', icon: ScrollText },
        { label: t('admin_sections.sessions'), href: '/admin/sessions', icon: Flag },
        { label: t('admin_sections.reviews'), href: '/admin/reviews', icon: Star },
        { label: t('admin_sections.reports'), href: '/admin/reports', icon: MessageSquareWarning },
        { label: t('admin_sections.badges'), href: '/admin/badges', icon: BadgeCheck },
        { label: t('admin_sections.content_pages'), href: '/admin/content-pages', icon: ScrollText },
        { label: t('admin_sections.translations'), href: '/admin/translations', icon: Languages },
        { label: t('admin_sections.platform_settings'), href: '/admin/platform-settings', icon: Settings },
    ];

    return (
        <div className="min-h-full bg-amber-50/30 dark:bg-amber-950/10">
            <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[17rem_1fr]">
                <aside className="border-b border-amber-200/70 bg-white/90 p-4 dark:border-amber-900/40 dark:bg-slate-950/70 lg:border-r lg:border-b-0">
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                            {t('admin.sidebar_title')}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {t('admin.sidebar_intro')}
                        </p>
                    </div>
                    <nav className="grid gap-1">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-950 dark:text-slate-200 dark:hover:bg-amber-950/30 dark:hover:text-amber-100',
                                    (url === item.href || (item.href !== '/admin' && url.startsWith(item.href))) &&
                                        'bg-amber-100 text-amber-950 dark:bg-amber-900/40 dark:text-amber-100',
                                )}
                            >
                                <item.icon className="size-4" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>
                <div>{children}</div>
            </div>
        </div>
    );
}

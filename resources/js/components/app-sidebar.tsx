import { Link, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    BellRing,
    CalendarClock,
    CalendarDays,
    FileText,
    Inbox,
    Languages,
    LayoutGrid,
    Presentation,
    Search,
    Shield,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const mainNavItems: NavItem[] = [
        {
            title: 'navigation.dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'navigation.find_free_classes',
            href: '/offers',
            icon: Search,
        },
        {
            title: 'navigation.preferences',
            href: '/profile/preferences',
            icon: Languages,
        },
        {
            title: 'navigation.learning_profile',
            href: '/profile/student',
            icon: BookOpenCheck,
        },
        {
            title: 'navigation.teacher_profile',
            href: '/profile/teacher',
            icon: Presentation,
        },
        {
            title: 'navigation.teaching_offers',
            href: '/teacher/offers',
            icon: FileText,
        },
        {
            title: 'navigation.my_availability',
            href: '/teacher/availability',
            icon: CalendarClock,
        },
        {
            title: 'navigation.my_applications',
            href: '/my-applications',
            icon: Inbox,
        },
        {
            title: 'navigation.my_sessions',
            href: '/my-sessions',
            icon: CalendarDays,
        },
        {
            title: 'navigation.requests_to_my_offers',
            href: '/teacher/applications',
            icon: Presentation,
        },
        {
            title: 'navigation.teacher_sessions',
            href: '/teacher/sessions',
            icon: CalendarDays,
        },
        {
            title: 'navigation.notification_preferences',
            href: '/profile/notification-preferences',
            icon: BellRing,
        },
    ];

    if (auth.user?.role === 'admin') {
        mainNavItems.push({
            title: 'navigation.admin',
            href: '/admin',
            icon: Shield,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
        </Sidebar>
    );
}

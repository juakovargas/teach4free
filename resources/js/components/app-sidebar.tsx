import { Link, usePage } from '@inertiajs/react';
import {
    BookOpenCheck,
    FileText,
    Inbox,
    Languages,
    LayoutGrid,
    Presentation,
    Search,
    Shield,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { LanguageSelector } from '@/components/language-selector';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
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
            title: 'navigation.my_applications',
            href: '/my-applications',
            icon: Inbox,
        },
        {
            title: 'navigation.requests_to_my_offers',
            href: '/teacher/applications',
            icon: Presentation,
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

            <SidebarFooter>
                <div className="px-2 group-data-[collapsible=icon]:hidden">
                    <LanguageSelector />
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

<?php

namespace Tests\Feature;

use Tests\TestCase;

class NavigationExperienceTest extends TestCase
{
    public function test_navbar_actions_keep_expected_global_control_order(): void
    {
        $source = $this->source('resources/js/components/navbar-actions.tsx');

        $appearance = strpos($source, '<AppearanceToggle');
        $language = strpos($source, '<LanguageSelector');
        $notifications = strpos($source, '<NotificationMenu');
        $userDropdown = strpos($source, '<UserDropdown');

        $this->assertNotFalse($appearance);
        $this->assertNotFalse($language);
        $this->assertNotFalse($notifications);
        $this->assertNotFalse($userDropdown);
        $this->assertLessThan($language, $appearance);
        $this->assertLessThan($notifications, $language);
        $this->assertLessThan($userDropdown, $notifications);
    }

    public function test_authenticated_and_public_headers_render_global_navbar_actions(): void
    {
        $authenticatedHeader = $this->source('resources/js/components/app-sidebar-header.tsx');
        $publicLayout = $this->source('resources/js/layouts/public-layout.tsx');

        $this->assertStringContainsString('NavbarActions', $authenticatedHeader);
        $this->assertStringContainsString('NavbarActions', $publicLayout);
        $this->assertStringContainsString("t('actions.start_teaching')", $publicLayout);
    }

    public function test_language_selector_is_not_rendered_in_sidebars(): void
    {
        $appSidebar = $this->source('resources/js/components/app-sidebar.tsx');
        $adminLayout = $this->source('resources/js/layouts/admin-layout.tsx');

        $this->assertStringNotContainsString('LanguageSelector', $appSidebar);
        $this->assertStringNotContainsString('LanguageSelector', $adminLayout);
        $this->assertStringContainsString("t('admin_sections.dashboard')", $adminLayout);
        $this->assertStringContainsString("t('admin_sections.platform_settings')", $adminLayout);
    }

    public function test_user_dropdown_contains_requested_items_and_logout(): void
    {
        $source = $this->source('resources/js/components/user-menu-content.tsx');

        $this->assertStringContainsString('href="/profile/preferences"', $source);
        $this->assertStringContainsString('href="/profile/student"', $source);
        $this->assertStringContainsString('href="/profile/teacher"', $source);
        $this->assertStringContainsString('href="/my-applications"', $source);
        $this->assertStringContainsString('href="/teacher/offers"', $source);
        $this->assertStringContainsString('href="/teacher/applications"', $source);
        $this->assertStringContainsString('href="/admin"', $source);
        $this->assertStringContainsString("t('navigation.my_teaching_offers')", $source);
        $this->assertStringContainsString('data-test="logout-button"', $source);
    }

    private function source(string $path): string
    {
        return file_get_contents(base_path($path)) ?: '';
    }
}

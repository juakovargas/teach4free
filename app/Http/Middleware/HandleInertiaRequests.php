<?php

namespace App\Http\Middleware;

use App\Models\ConversationReport;
use App\Models\CookieSetting;
use App\Models\Incident;
use App\Models\PlatformTrackingSetting;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Lang;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $cookieSettings = CookieSetting::current();
        $trackingSettings = PlatformTrackingSetting::current();
        $countryCode = $this->visitorCountryCode($request);
        $messageUnreadCount = $request->user()
            ? app(ConversationService::class)->unreadCountFor($request->user())
            : 0;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => app()->getLocale(),
            'locales' => collect(config('app.supported_locales'))->map(
                fn (string $name, string $code): array => [
                    'code' => $code,
                    'name' => $name,
                ]
            )->values(),
            'translations' => Lang::get('ui'),
            'flash' => [
                'status' => $request->session()->get('status'),
            ],
            'notifications' => $request->user()
                ? [
                    'unread_count' => $request->user()->unreadNotifications()->count(),
                    'latest' => $request->user()
                        ->notifications()
                        ->latest()
                        ->limit(5)
                        ->get()
                        ->map(fn (DatabaseNotification $notification): array => [
                            'id' => $notification->id,
                            'title' => $notification->data['title'] ?? '',
                            'message' => $notification->data['message'] ?? '',
                            'action_url' => $notification->data['action_url'] ?? null,
                            'read_at' => $notification->read_at,
                            'created_at' => $notification->created_at,
                        ]),
                ]
                : [
                    'unread_count' => 0,
                    'latest' => [],
                ],
            'messages' => [
                'unread_count' => $messageUnreadCount,
            ],
            'admin_moderation' => $this->adminModeration($request),
            'impersonation' => $this->impersonation($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'cookieConsent' => [
                'required' => $this->cookieConsentRequired($cookieSettings, $countryCode),
                'detected_country_code' => $countryCode,
                'settings' => [
                    'banner_enabled' => $cookieSettings->banner_enabled,
                    'consent_required_regions' => $cookieSettings->consent_required_regions,
                    'consent_duration_days' => $cookieSettings->consent_duration_days,
                    'consent_version' => $cookieSettings->consent_version,
                    'show_reject_button' => $cookieSettings->show_reject_button,
                    'show_configure_button' => $cookieSettings->show_configure_button,
                    'block_analytics_until_consent' => $cookieSettings->block_analytics_until_consent,
                    'block_marketing_until_consent' => $cookieSettings->block_marketing_until_consent,
                    'block_external_content_until_consent' => $cookieSettings->block_external_content_until_consent,
                    'banner_style' => $cookieSettings->banner_style,
                    'cookie_policy_url' => route('cookie-policy'),
                ],
                'tracking' => [
                    'tracking_enabled' => $trackingSettings->tracking_enabled,
                    'cookie_consent_required' => $trackingSettings->cookie_consent_required,
                    'google_analytics_id' => $trackingSettings->google_analytics_id,
                    'google_tag_manager_id' => $trackingSettings->google_tag_manager_id,
                    'meta_pixel_id' => $trackingSettings->meta_pixel_id,
                    'tiktok_pixel_id' => $trackingSettings->tiktok_pixel_id,
                    'linkedin_partner_id' => $trackingSettings->linkedin_partner_id,
                    'microsoft_clarity_id' => $trackingSettings->microsoft_clarity_id,
                    'plausible_domain' => $trackingSettings->plausible_domain,
                    'custom_head_script' => $trackingSettings->custom_head_script,
                    'custom_body_script' => $trackingSettings->custom_body_script,
                ],
            ],
        ];
    }

    /**
     * @return array<string, int>
     */
    private function adminModeration(Request $request): array
    {
        if ($request->user()?->role !== User::ROLE_ADMIN) {
            return [
                'open_incidents' => 0,
                'open_conversation_reports' => 0,
                'pending_moderation' => 0,
                'reports_awaiting_response' => 0,
            ];
        }

        $hasIncidents = Schema::hasTable('incidents');
        $hasConversationReports = Schema::hasTable('conversation_reports');
        $openIncidents = $hasIncidents
            ? Incident::query()->where('status', Incident::STATUS_OPEN)->count()
            : 0;
        $openConversationReports = $hasConversationReports
            ? ConversationReport::query()->where('status', ConversationReport::STATUS_OPEN)->count()
            : 0;
        $reportsAwaitingResponse = ($hasIncidents && Schema::hasColumn('incidents', 'public_response')
            ? Incident::query()
                ->whereNotNull('reporter_user_id')
                ->whereIn('status', Incident::STATUSES)
                ->whereNull('public_response')
                ->count()
            : 0)
            + ($hasConversationReports && Schema::hasColumn('conversation_reports', 'public_response')
                ? ConversationReport::query()
                    ->whereNotNull('reporter_user_id')
                    ->whereIn('status', ConversationReport::STATUSES)
                    ->whereNull('public_response')
                    ->count()
                : 0);

        return [
            'open_incidents' => $openIncidents,
            'open_conversation_reports' => $openConversationReports,
            'pending_moderation' => $openIncidents + $openConversationReports,
            'reports_awaiting_response' => $reportsAwaitingResponse,
        ];
    }

    private function cookieConsentRequired(CookieSetting $settings, ?string $countryCode): bool
    {
        if (! $settings->banner_enabled) {
            return false;
        }

        if ($settings->consent_required_regions === CookieSetting::REGION_ALL) {
            return true;
        }

        if (! $countryCode) {
            return true;
        }

        if ($settings->consent_required_regions === CookieSetting::REGION_CUSTOM) {
            $customCountryCodes = $settings->customCountryCodes();

            return $customCountryCodes === [] || in_array($countryCode, $customCountryCodes, true);
        }

        return in_array($countryCode, CookieSetting::consentRequiredCountryCodes(), true);
    }

    private function visitorCountryCode(Request $request): ?string
    {
        $userCountryCode = $request->user()?->country_code;

        if (is_string($userCountryCode) && $userCountryCode !== '') {
            return strtoupper($userCountryCode);
        }

        foreach (['CF-IPCountry', 'X-App-Country-Code'] as $header) {
            $countryCode = $request->headers->get($header);

            if (is_string($countryCode) && preg_match('/^[A-Za-z]{2}$/', $countryCode) === 1) {
                return strtoupper($countryCode);
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function impersonation(Request $request): array
    {
        $impersonatorId = $request->session()->get('impersonator_id');

        if (! $impersonatorId || ! $request->user()) {
            return ['active' => false];
        }

        $impersonator = User::query()->find($impersonatorId);

        if (! $impersonator) {
            return ['active' => false];
        }

        return [
            'active' => true,
            'impersonator' => [
                'id' => $impersonator->id,
                'name' => $impersonator->name,
                'email' => $impersonator->email,
            ],
            'user' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
            ],
        ];
    }
}

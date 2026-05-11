<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Lang;
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
            'impersonation' => $this->impersonation($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
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

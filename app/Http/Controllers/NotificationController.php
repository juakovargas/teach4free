<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('notifications/index', [
            'notifications' => $request->user()
                ->notifications()
                ->latest()
                ->limit(100)
                ->get()
                ->map(fn (DatabaseNotification $notification): array => $this->notificationData($notification)),
        ]);
    }

    public function read(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $this->authorizeNotification($request, $notification);

        $notification->markAsRead();

        return back()->with('status', __('ui.notifications.marked_read'));
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return back()->with('status', __('ui.notifications.marked_all_read'));
    }

    private function authorizeNotification(Request $request, DatabaseNotification $notification): void
    {
        abort_unless(
            $notification->notifiable_type === get_class($request->user())
            && (int) $notification->notifiable_id === $request->user()->id,
            403,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function notificationData(DatabaseNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'title' => $notification->data['title'] ?? '',
            'message' => $notification->data['message'] ?? '',
            'action_url' => $notification->data['action_url'] ?? null,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
        ];
    }
}

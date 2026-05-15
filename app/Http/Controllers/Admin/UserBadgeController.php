<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\User;
use App\Models\UserBadge;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserBadgeController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'badge' => ['nullable', 'integer', 'exists:badges,id'],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'revoked', 'hidden', 'featured'])],
        ]);

        return Inertia::render('admin/user-badges/index', [
            'userBadges' => $this->queryRows($filters)->limit(200)->get()->map(fn (UserBadge $userBadge): array => $this->rowPayload($userBadge)),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'badge' => $filters['badge'] ?? '',
                'status' => $filters['status'] ?? 'all',
            ],
            'badges' => Badge::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'key', 'name']),
            'user' => null,
        ]);
    }

    public function user(Request $request, User $user): Response
    {
        $filters = ['search' => '', 'badge' => '', 'status' => 'all'];

        return Inertia::render('admin/user-badges/index', [
            'userBadges' => UserBadge::query()
                ->where('user_id', $user->id)
                ->with(['badge', 'user:id,name,email,avatar_path,avatar_url', 'revokedBy:id,name,email'])
                ->latest('awarded_at')
                ->get()
                ->map(fn (UserBadge $userBadge): array => $this->rowPayload($userBadge)),
            'filters' => $filters,
            'badges' => Badge::query()->orderBy('sort_order')->orderBy('name')->get(['id', 'key', 'name']),
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function revoke(Request $request, User $user, Badge $badge): RedirectResponse
    {
        $data = $request->validate([
            'revoked_reason' => ['required', 'string', 'max:2000'],
        ]);

        $userBadge = UserBadge::query()
            ->where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->firstOrFail();

        $userBadge->forceFill([
            'is_visible' => false,
            'is_featured' => false,
            'featured_sort_order' => 0,
            'revoked_at' => now(),
            'revoked_by' => $request->user()->id,
            'revoked_reason' => $data['revoked_reason'],
        ])->save();

        return back()->with('status', __('ui.admin_user_badges.revoked'));
    }

    public function restore(Request $request, User $user, Badge $badge): RedirectResponse
    {
        $userBadge = UserBadge::query()
            ->where('user_id', $user->id)
            ->where('badge_id', $badge->id)
            ->firstOrFail();

        $userBadge->forceFill([
            'revoked_at' => null,
            'revoked_by' => null,
            'revoked_reason' => null,
            'is_visible' => true,
        ])->save();

        return back()->with('status', __('ui.admin_user_badges.restored'));
    }

    private function queryRows(array $filters)
    {
        return UserBadge::query()
            ->with(['badge', 'user:id,name,email,avatar_path,avatar_url', 'revokedBy:id,name,email'])
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                ->where(fn ($query) => $query
                    ->whereHas('user', fn ($query) => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"))
                    ->orWhereHas('badge', fn ($query) => $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('key', 'like', "%{$search}%"))))
            ->when($filters['badge'] ?? null, fn ($query, int $badgeId) => $query->where('badge_id', $badgeId))
            ->when(($filters['status'] ?? 'all') === 'active', fn ($query) => $query->whereNull('revoked_at'))
            ->when(($filters['status'] ?? 'all') === 'revoked', fn ($query) => $query->whereNotNull('revoked_at'))
            ->when(($filters['status'] ?? 'all') === 'hidden', fn ($query) => $query->where('is_visible', false)->whereNull('revoked_at'))
            ->when(($filters['status'] ?? 'all') === 'featured', fn ($query) => $query->where('is_featured', true)->whereNull('revoked_at'))
            ->latest('awarded_at');
    }

    /**
     * @return array<string, mixed>
     */
    private function rowPayload(UserBadge $userBadge): array
    {
        return [
            'id' => $userBadge->id,
            'user' => [
                'id' => $userBadge->user?->id,
                'name' => $userBadge->user?->name,
                'email' => $userBadge->user?->email,
                'avatar' => $userBadge->user?->avatar,
                'initials' => $userBadge->user?->initials,
                'admin_url' => $userBadge->user ? route('admin.users.show', $userBadge->user) : null,
            ],
            'badge' => [
                'id' => $userBadge->badge?->id,
                'key' => $userBadge->badge?->key,
                'name' => $userBadge->badge?->name,
                'description' => $userBadge->badge?->description,
                'icon' => $userBadge->badge?->icon,
                'color' => $userBadge->badge?->color,
                'category' => $userBadge->badge?->category,
            ],
            'awarded_at' => $userBadge->awarded_at?->toISOString(),
            'awarded_reason' => $userBadge->awarded_reason,
            'is_visible' => $userBadge->is_visible,
            'is_featured' => $userBadge->is_featured,
            'revoked_at' => $userBadge->revoked_at?->toISOString(),
            'revoked_reason' => $userBadge->revoked_reason,
            'revoked_by' => $userBadge->revokedBy ? [
                'name' => $userBadge->revokedBy->name,
                'email' => $userBadge->revokedBy->email,
            ] : null,
        ];
    }
}

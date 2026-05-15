<?php

namespace App\Http\Controllers;

use App\Models\UserBadge;
use App\Services\BadgeAwardingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class TeacherBadgeController extends Controller
{
    public function edit(Request $request, BadgeAwardingService $badges): Response
    {
        abort_unless($request->user()->teacherProfile !== null, 403);

        $badges->awardForTeacher($request->user());

        return Inertia::render('profile/teacher-badges', [
            'badges' => $this->badgeRows($request),
            'featuredLimit' => UserBadge::FEATURED_LIMIT,
            'publicProfileUrl' => $request->user()->teacherProfile?->is_active
                ? route('teachers.show', $request->user())
                : null,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()->teacherProfile !== null, 403);

        $validated = $request->validate([
            'badges' => ['required', 'array'],
            'badges.*.id' => ['required', 'integer'],
            'badges.*.is_visible' => ['required', 'boolean'],
            'badges.*.is_featured' => ['required', 'boolean'],
        ]);

        $incoming = collect($validated['badges']);
        $ownedBadges = UserBadge::query()
            ->where('user_id', $request->user()->id)
            ->whereIn('id', $incoming->pluck('id'))
            ->get()
            ->keyBy('id');

        abort_unless($ownedBadges->count() === $incoming->count(), 403);

        $featured = $incoming->filter(fn (array $badge): bool => (bool) $badge['is_featured']);

        if ($featured->count() > UserBadge::FEATURED_LIMIT) {
            return back()->withErrors([
                'badges' => __('ui.teacher_badges.featured_limit_error', [
                    'count' => UserBadge::FEATURED_LIMIT,
                ]),
            ]);
        }

        if ($featured->contains(fn (array $badge): bool => ! (bool) $badge['is_visible'])) {
            return back()->withErrors([
                'badges' => __('ui.teacher_badges.featured_visibility_error'),
            ]);
        }

        foreach ($incoming->values() as $index => $badgeData) {
            /** @var UserBadge $userBadge */
            $userBadge = $ownedBadges[(int) $badgeData['id']];

            if ($userBadge->revoked_at !== null) {
                continue;
            }

            $isVisible = (bool) $badgeData['is_visible'];
            $isFeatured = (bool) $badgeData['is_featured'];

            $userBadge->forceFill([
                'is_visible' => $isVisible,
                'is_featured' => $isFeatured,
                'featured_sort_order' => $isFeatured ? $index + 1 : 0,
                'hidden_at' => $isVisible ? null : now(),
                'hidden_by_user' => ! $isVisible,
            ])->save();
        }

        return back()->with('status', __('ui.teacher_badges.saved'));
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    private function badgeRows(Request $request)
    {
        return UserBadge::query()
            ->where('user_id', $request->user()->id)
            ->with('badge')
            ->orderByRaw('revoked_at is not null')
            ->orderByDesc('is_featured')
            ->orderBy('featured_sort_order')
            ->latest('awarded_at')
            ->get()
            ->map(fn (UserBadge $badge): array => $badge->publicPayload());
    }
}

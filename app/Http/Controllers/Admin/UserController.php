<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\TeachingOfferApplication;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $countryCodes = User::query()
            ->whereNotNull('country_code')
            ->distinct()
            ->orderBy('country_code')
            ->pluck('country_code')
            ->filter()
            ->values();

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'role' => ['nullable', 'string', Rule::in(['all', User::ROLE_ADMIN, User::ROLE_USER])],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'banned', 'blocked'])],
            'email' => ['nullable', 'string', Rule::in(['all', 'verified', 'unverified'])],
            'profile' => ['nullable', 'string', Rule::in(['all', 'student', 'teacher', 'both', 'google'])],
            'country' => ['nullable', 'string', Rule::in(array_merge(['all'], $countryCodes->all()))],
        ]);

        $users = User::query()
            ->with(['studentProfile:id,user_id,is_active', 'teacherProfile:id,user_id,is_active,is_verified'])
            ->withCount(['teachingOffers', 'learningApplications'])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when(($filters['role'] ?? 'all') !== 'all', fn ($query) => $query->where('role', $filters['role']))
            ->when(($filters['status'] ?? 'all') === 'active', fn ($query) => $query->whereNull('banned_at')->whereNull('blocked_at'))
            ->when(($filters['status'] ?? 'all') === 'banned', fn ($query) => $query->whereNotNull('banned_at'))
            ->when(($filters['status'] ?? 'all') === 'blocked', fn ($query) => $query->whereNotNull('blocked_at'))
            ->when(($filters['email'] ?? 'all') === 'verified', fn ($query) => $query->whereNotNull('email_verified_at'))
            ->when(($filters['email'] ?? 'all') === 'unverified', fn ($query) => $query->whereNull('email_verified_at'))
            ->when(($filters['country'] ?? 'all') !== 'all', fn ($query) => $query->where('country_code', $filters['country']))
            ->when(($filters['profile'] ?? 'all') === 'student', fn ($query) => $query->whereHas('studentProfile'))
            ->when(($filters['profile'] ?? 'all') === 'teacher', fn ($query) => $query->whereHas('teacherProfile'))
            ->when(($filters['profile'] ?? 'all') === 'both', fn ($query) => $query->whereHas('studentProfile')->whereHas('teacherProfile'))
            ->when(($filters['profile'] ?? 'all') === 'google', fn ($query) => $query->whereNotNull('google_id'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'role' => $filters['role'] ?? 'all',
                'status' => $filters['status'] ?? 'all',
                'email' => $filters['email'] ?? 'all',
                'profile' => $filters['profile'] ?? 'all',
                'country' => $filters['country'] ?? 'all',
            ],
            'countries' => $countryCodes,
        ]);
    }

    public function show(User $user): Response
    {
        $user->load([
            'studentProfile',
            'teacherProfile',
            'userLanguages.language',
            'teachingOffers.category',
            'teachingOffers.subject',
            'learningApplications.offer',
            'reportedIncidents.reporter',
        ]);

        return Inertia::render('admin/users/show', [
            'managedUser' => $user,
            'summary' => [
                'teaching_offers_count' => $user->teachingOffers->count(),
                'learning_applications_count' => $user->learningApplications->count(),
                'pending_applications_count' => $user->learningApplications
                    ->where('status', TeachingOfferApplication::STATUS_PENDING)
                    ->count(),
                'incidents_count' => $user->reportedIncidents->count(),
            ],
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'preferred_locale' => ['required', 'string', Rule::in(array_keys(config('app.supported_locales')))],
            'timezone' => ['required', 'string', 'timezone'],
            'country_code' => ['nullable', 'string', 'size:2'],
            'city' => ['nullable', 'string', 'max:255'],
            'email_verified' => ['required', 'boolean'],
        ]);

        $user->forceFill([
            'name' => $data['name'],
            'preferred_locale' => $data['preferred_locale'],
            'timezone' => $data['timezone'],
            'country_code' => $data['country_code'] ? strtoupper($data['country_code']) : null,
            'city' => $data['city'] ?: null,
            'email_verified_at' => $data['email_verified'] ? ($user->email_verified_at ?? now()) : null,
        ])->save();

        $this->audit($request, 'admin.user.updated', $user);

        return back()->with('status', __('ui.admin_users.updated'));
    }

    public function ban(Request $request, User $user): RedirectResponse
    {
        $this->ensureCanRestrict($request, $user);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $user->forceFill([
            'banned_at' => now(),
            'banned_reason' => $data['reason'] ?: __('ui.admin_users.no_reason'),
        ])->save();

        $this->audit($request, 'admin.user.banned', $user, ['reason' => $user->banned_reason]);

        return back()->with('status', __('ui.admin_users.banned'));
    }

    public function unban(Request $request, User $user): RedirectResponse
    {
        $user->forceFill([
            'banned_at' => null,
            'banned_reason' => null,
        ])->save();

        $this->audit($request, 'admin.user.unbanned', $user);

        return back()->with('status', __('ui.admin_users.unbanned'));
    }

    public function block(Request $request, User $user): RedirectResponse
    {
        $this->ensureCanRestrict($request, $user);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:2000'],
        ]);

        $user->forceFill([
            'blocked_at' => now(),
            'blocked_reason' => $data['reason'] ?: __('ui.admin_users.no_reason'),
        ])->save();

        $this->audit($request, 'admin.user.blocked', $user, ['reason' => $user->blocked_reason]);

        return back()->with('status', __('ui.admin_users.blocked'));
    }

    public function unblock(Request $request, User $user): RedirectResponse
    {
        $user->forceFill([
            'blocked_at' => null,
            'blocked_reason' => null,
        ])->save();

        $this->audit($request, 'admin.user.unblocked', $user);

        return back()->with('status', __('ui.admin_users.unblocked'));
    }

    private function ensureCanRestrict(Request $request, User $user): void
    {
        abort_if($request->user()->is($user), 422, __('ui.admin_users.self_restriction_error'));
        abort_if($user->isAdmin(), 422, __('ui.admin_users.admin_restriction_error'));
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    private function audit(Request $request, string $action, User $target, array $metadata = []): void
    {
        AuditLog::create([
            'actor_user_id' => $request->user()->id,
            'target_user_id' => $target->id,
            'action' => $action,
            'metadata' => $metadata,
            'ip_address' => $request->ip(),
        ]);
    }
}

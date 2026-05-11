<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function start(Request $request, User $user): RedirectResponse
    {
        $admin = $request->user();

        abort_if($admin->is($user), 422, __('ui.impersonation.self_error'));
        abort_if($user->isAdmin(), 422, __('ui.impersonation.admin_error'));
        abort_if($user->isRestricted(), 422, __('ui.impersonation.restricted_error'));

        AuditLog::create([
            'actor_user_id' => $admin->id,
            'target_user_id' => $user->id,
            'action' => 'admin.impersonation.started',
            'metadata' => ['target_email' => $user->email],
            'ip_address' => $request->ip(),
        ]);

        $request->session()->put('impersonator_id', $admin->id);
        Auth::login($user);

        return redirect()->route('dashboard');
    }

    public function stop(Request $request): RedirectResponse
    {
        $impersonated = $request->user();
        $adminId = $request->session()->pull('impersonator_id');

        abort_unless($adminId, 403);

        Auth::loginUsingId($adminId);

        AuditLog::create([
            'actor_user_id' => $adminId,
            'target_user_id' => $impersonated?->id,
            'action' => 'admin.impersonation.stopped',
            'metadata' => ['target_email' => $impersonated?->email],
            'ip_address' => $request->ip(),
        ]);

        return redirect()->route('admin.users.show', $impersonated);
    }
}

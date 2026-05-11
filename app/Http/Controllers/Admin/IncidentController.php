<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Incident;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IncidentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', Rule::in(array_merge(['all'], Incident::STATUSES))],
            'type' => ['nullable', 'string', Rule::in(array_merge(['all'], Incident::TYPES))],
            'priority' => ['nullable', 'string', Rule::in(array_merge(['all'], Incident::PRIORITIES))],
        ]);

        return Inertia::render('admin/incidents/index', [
            'incidents' => Incident::query()
                ->with(['reporter:id,name,email,avatar_path,avatar_url', 'reportedUser:id,name,email,avatar_path,avatar_url', 'teachingOffer:id,title,slug'])
                ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query->where('status', $filters['status']))
                ->when(($filters['type'] ?? 'all') !== 'all', fn ($query) => $query->where('type', $filters['type']))
                ->when(($filters['priority'] ?? 'all') !== 'all', fn ($query) => $query->where('priority', $filters['priority']))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'filters' => [
                'status' => $filters['status'] ?? 'all',
                'type' => $filters['type'] ?? 'all',
                'priority' => $filters['priority'] ?? 'all',
            ],
            'statuses' => Incident::STATUSES,
            'types' => Incident::TYPES,
            'priorities' => Incident::PRIORITIES,
        ]);
    }

    public function show(Incident $incident): Response
    {
        $incident->load([
            'reporter:id,name,email,avatar_path,avatar_url',
            'reportedUser:id,name,email,avatar_path,avatar_url',
            'teachingOffer:id,title,slug',
            'application:id,status,message',
            'resolver:id,name,email',
        ]);

        return Inertia::render('admin/incidents/show', [
            'incident' => $incident,
            'statuses' => Incident::STATUSES,
            'priorities' => Incident::PRIORITIES,
        ]);
    }

    public function update(Request $request, Incident $incident): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(Incident::STATUSES)],
            'priority' => ['required', 'string', Rule::in(Incident::PRIORITIES)],
            'admin_notes' => ['nullable', 'string', 'max:4000'],
        ]);

        $resolved = in_array($data['status'], [Incident::STATUS_RESOLVED, Incident::STATUS_DISMISSED], true);

        $incident->forceFill([
            'status' => $data['status'],
            'priority' => $data['priority'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'resolved_by' => $resolved ? $request->user()->id : null,
            'resolved_at' => $resolved ? now() : null,
        ])->save();

        AuditLog::create([
            'actor_user_id' => $request->user()->id,
            'target_user_id' => $incident->reported_user_id,
            'action' => 'admin.incident.updated',
            'metadata' => ['incident_id' => $incident->id, 'status' => $incident->status],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('status', __('ui.admin_incidents.updated'));
    }
}

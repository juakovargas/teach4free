<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Incident;
use App\Models\TeachingOffer;
use App\Models\User;
use App\Notifications\ReportFollowUpNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IncidentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in(array_merge(['all'], Incident::STATUSES))],
            'type' => ['nullable', 'string', Rule::in(array_merge(['all'], Incident::TYPES))],
            'priority' => ['nullable', 'string', Rule::in(array_merge(['all'], Incident::PRIORITIES))],
            'reporter_user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'reported_user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'teaching_offer_id' => ['nullable', 'integer', Rule::exists('teaching_offers', 'id')],
        ]);

        return Inertia::render('admin/incidents/index', [
            'incidents' => Incident::query()
                ->with([
                    'reporter:id,name,email,avatar_path,avatar_url',
                    'reportedUser:id,name,email,avatar_path,avatar_url',
                    'teachingOffer:id,title,slug',
                    'application:id,status,teaching_offer_id,student_user_id',
                    'classSession:id,title,status,starts_at,teaching_offer_id',
                ])
                ->when($filters['search'] ?? null, fn ($query, string $search) => $query
                    ->where(fn ($query) => $query
                        ->where('subject', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('admin_notes', 'like', "%{$search}%")
                        ->orWhereHas('reporter', fn ($query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('reportedUser', fn ($query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('teachingOffer', fn ($query) => $query->where('title', 'like', "%{$search}%"))))
                ->when(($filters['status'] ?? 'all') !== 'all', fn ($query) => $query->where('status', $filters['status']))
                ->when(($filters['type'] ?? 'all') !== 'all', fn ($query) => $query->where('type', $filters['type']))
                ->when(($filters['priority'] ?? 'all') !== 'all', fn ($query) => $query->where('priority', $filters['priority']))
                ->when($filters['reporter_user_id'] ?? null, fn ($query, int $userId) => $query->where('reporter_user_id', $userId))
                ->when($filters['reported_user_id'] ?? null, fn ($query, int $userId) => $query->where('reported_user_id', $userId))
                ->when($filters['teaching_offer_id'] ?? null, fn ($query, int $offerId) => $query->where('teaching_offer_id', $offerId))
                ->latest()
                ->paginate(20)
                ->withQueryString(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'type' => $filters['type'] ?? 'all',
                'priority' => $filters['priority'] ?? 'all',
                'reporter_user_id' => $filters['reporter_user_id'] ?? '',
                'reported_user_id' => $filters['reported_user_id'] ?? '',
                'teaching_offer_id' => $filters['teaching_offer_id'] ?? '',
            ],
            'statuses' => Incident::STATUSES,
            'types' => Incident::TYPES,
            'priorities' => Incident::PRIORITIES,
            'filterOptions' => [
                'reporters' => $this->incidentUsers('reporter_user_id'),
                'reportedUsers' => $this->incidentUsers('reported_user_id'),
                'teachingOffers' => $this->incidentOffers(),
            ],
        ]);
    }

    public function show(Incident $incident): Response
    {
        $incident->load([
            'reporter:id,name,email,avatar_path,avatar_url',
            'reportedUser:id,name,email,avatar_path,avatar_url',
            'teachingOffer:id,title,slug',
            'application:id,status,message,teaching_offer_id,student_user_id,teacher_user_id',
            'application.student:id,name,email',
            'application.teacher:id,name,email',
            'classSession:id,title,status,starts_at,ends_at,timezone,teaching_offer_id,application_id',
            'resolver:id,name,email',
            'publicResponder:id,name,email',
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
            'public_response' => ['nullable', 'string', 'max:5000'],
        ]);

        $previousStatus = $incident->status;
        $previousPublicResponse = $incident->public_response;
        $resolved = in_array($data['status'], [Incident::STATUS_RESOLVED, Incident::STATUS_DISMISSED], true);
        $publicResponse = trim((string) ($data['public_response'] ?? ''));
        $publicResponse = $publicResponse === '' ? null : $publicResponse;
        $publicResponseChanged = trim((string) $previousPublicResponse) !== trim((string) $publicResponse);

        $incident->forceFill([
            'status' => $data['status'],
            'priority' => $data['priority'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'public_response' => $publicResponse,
            'public_response_by' => $publicResponse ? $request->user()->id : null,
            'public_response_sent_at' => $publicResponse && ($publicResponseChanged || ! $incident->public_response_sent_at)
                ? now()
                : ($publicResponse ? $incident->public_response_sent_at : null),
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

        $this->notifyReporterIfNeeded($incident, $previousStatus, $publicResponseChanged);

        return back()->with('status', __('ui.admin_incidents.updated'));
    }

    private function notifyReporterIfNeeded(Incident $incident, string $previousStatus, bool $publicResponseChanged): void
    {
        if (! $incident->reporter) {
            return;
        }

        if ($publicResponseChanged && $incident->public_response) {
            $incident->reporter->notify(new ReportFollowUpNotification(
                ReportFollowUpNotification::KIND_INCIDENT,
                $incident->id,
                $incident->subject,
                $incident->status,
                ReportFollowUpNotification::EVENT_RESPONSE_UPDATED,
            ));

            return;
        }

        if ($previousStatus !== $incident->status) {
            $incident->reporter->notify(new ReportFollowUpNotification(
                ReportFollowUpNotification::KIND_INCIDENT,
                $incident->id,
                $incident->subject,
                $incident->status,
                ReportFollowUpNotification::EVENT_STATUS_UPDATED,
            ));
        }
    }

    /**
     * @return Collection<int, array{id: int, name: string, email: string}>
     */
    private function incidentUsers(string $column)
    {
        $userIds = Incident::query()
            ->whereNotNull($column)
            ->distinct()
            ->pluck($column);

        return User::query()
            ->whereIn('id', $userIds)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }

    /**
     * @return Collection<int, array{id: int, title: string, slug: string}>
     */
    private function incidentOffers()
    {
        $offerIds = Incident::query()
            ->whereNotNull('teaching_offer_id')
            ->distinct()
            ->pluck('teaching_offer_id');

        return TeachingOffer::query()
            ->whereIn('id', $offerIds)
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);
    }
}

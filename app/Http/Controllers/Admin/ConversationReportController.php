<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ConversationReport;
use App\Notifications\ReportFollowUpNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConversationReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'status' => $request->string('status')->toString() ?: 'open',
            'type' => $request->string('type')->toString() ?: 'all',
            'priority' => $request->string('priority')->toString() ?: 'all',
            'search' => $request->string('search')->toString(),
        ];

        $reports = ConversationReport::query()
            ->with([
                'conversation:id,subject,type,status,last_message_at',
                'message:id,body,sender_user_id,created_at',
                'reporter:id,name,email,avatar_path,avatar_url',
                'reportedUser:id,name,email,avatar_path,avatar_url',
            ])
            ->when($filters['status'] !== 'all', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['type'] !== 'all', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['priority'] !== 'all', fn ($query) => $query->where('priority', $filters['priority']))
            ->when($filters['search'], function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('description', 'like', "%{$search}%")
                        ->orWhereHas('conversation', fn ($query) => $query->where('subject', 'like', "%{$search}%"))
                        ->orWhereHas('message', fn ($query) => $query->where('body', 'like', "%{$search}%"))
                        ->orWhereHas('reporter', fn ($query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('reportedUser', fn ($query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"));
                });
            })
            ->orderByRaw("case priority when 'urgent' then 0 when 'high' then 1 when 'normal' then 2 else 3 end")
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('admin/conversation-reports/index', [
            'reports' => $reports,
            'filters' => $filters,
            'types' => ConversationReport::TYPES,
            'statuses' => ConversationReport::STATUSES,
            'priorities' => ConversationReport::PRIORITIES,
        ]);
    }

    public function show(ConversationReport $report): Response
    {
        $report->load([
            'conversation.participants.user:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
            'conversation.teachingOffer:id,title,slug',
            'conversation.classSession:id,title,status,starts_at',
            'message.sender:id,name,email,avatar_path,avatar_url',
            'reporter:id,name,email,avatar_path,avatar_url',
            'reportedUser:id,name,email,avatar_path,avatar_url',
            'resolver:id,name,email',
            'publicResponder:id,name,email',
        ]);

        return Inertia::render('admin/conversation-reports/show', [
            'report' => $report,
            'types' => ConversationReport::TYPES,
            'statuses' => ConversationReport::STATUSES,
            'priorities' => ConversationReport::PRIORITIES,
        ]);
    }

    public function update(Request $request, ConversationReport $report): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(ConversationReport::STATUSES)],
            'priority' => ['required', 'string', Rule::in(ConversationReport::PRIORITIES)],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
            'public_response' => ['nullable', 'string', 'max:5000'],
        ]);

        $previousStatus = $report->status;
        $previousPublicResponse = $report->public_response;
        $resolved = in_array($data['status'], [
            ConversationReport::STATUS_RESOLVED,
            ConversationReport::STATUS_DISMISSED,
        ], true);
        $publicResponse = trim((string) ($data['public_response'] ?? ''));
        $publicResponse = $publicResponse === '' ? null : $publicResponse;
        $publicResponseChanged = trim((string) $previousPublicResponse) !== trim((string) $publicResponse);

        $report->forceFill([
            'status' => $data['status'],
            'priority' => $data['priority'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'public_response' => $publicResponse,
            'public_response_by' => $publicResponse ? $request->user()->id : null,
            'public_response_sent_at' => $publicResponse && ($publicResponseChanged || ! $report->public_response_sent_at)
                ? now()
                : ($publicResponse ? $report->public_response_sent_at : null),
            'resolved_by' => $resolved ? $request->user()->id : null,
            'resolved_at' => $resolved ? now() : null,
        ])->save();

        AuditLog::create([
            'actor_user_id' => $request->user()->id,
            'target_user_id' => $report->reported_user_id,
            'action' => 'admin.conversation_report.updated',
            'metadata' => ['conversation_report_id' => $report->id, 'status' => $report->status],
            'ip_address' => $request->ip(),
        ]);

        $this->notifyReporterIfNeeded($report, $previousStatus, $publicResponseChanged);

        return back()->with('status', __('ui.admin_conversation_reports.updated'));
    }

    private function notifyReporterIfNeeded(ConversationReport $report, string $previousStatus, bool $publicResponseChanged): void
    {
        if (! $report->reporter) {
            return;
        }

        $subject = $report->conversation?->subject ?: __('ui.messages.untitled_conversation', [], 'en');

        if ($publicResponseChanged && $report->public_response) {
            $report->reporter->notify(new ReportFollowUpNotification(
                ReportFollowUpNotification::KIND_CONVERSATION_REPORT,
                $report->id,
                $subject,
                $report->status,
                ReportFollowUpNotification::EVENT_RESPONSE_UPDATED,
            ));

            return;
        }

        if ($previousStatus !== $report->status) {
            $report->reporter->notify(new ReportFollowUpNotification(
                ReportFollowUpNotification::KIND_CONVERSATION_REPORT,
                $report->id,
                $subject,
                $report->status,
                ReportFollowUpNotification::EVENT_STATUS_UPDATED,
            ));
        }
    }
}

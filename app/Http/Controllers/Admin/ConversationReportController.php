<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ConversationReport;
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
        ]);

        $resolved = in_array($data['status'], [
            ConversationReport::STATUS_RESOLVED,
            ConversationReport::STATUS_DISMISSED,
        ], true);

        $report->forceFill([
            'status' => $data['status'],
            'priority' => $data['priority'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'resolved_by' => $resolved ? $request->user()->id : null,
            'resolved_at' => $resolved ? now() : null,
        ])->save();

        return back()->with('status', __('ui.admin_conversation_reports.updated'));
    }
}

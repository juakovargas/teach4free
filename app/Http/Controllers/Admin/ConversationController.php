<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Services\ConversationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    public function __construct(private readonly ConversationService $conversations) {}

    public function index(Request $request): Response
    {
        $filters = [
            'status' => $request->string('status')->toString() ?: 'all',
            'type' => $request->string('type')->toString() ?: 'all',
            'reported' => $request->boolean('reported', true),
            'search' => $request->string('search')->toString(),
        ];

        $conversations = Conversation::query()
            ->with([
                'participants.user:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
                'latestMessage.sender:id,name',
                'teachingOffer:id,title,slug',
                'classSession:id,title,status,starts_at',
            ])
            ->withCount('reports')
            ->when($filters['reported'], fn ($query) => $query->where(function ($query): void {
                $query->where('status', Conversation::STATUS_REPORTED)->orWhereHas('reports');
            }))
            ->when($filters['status'] !== 'all', fn ($query) => $query->where('status', $filters['status']))
            ->when($filters['type'] !== 'all', fn ($query) => $query->where('type', $filters['type']))
            ->when($filters['search'], function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('subject', 'like', "%{$search}%")
                        ->orWhereHas('users', fn ($query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('teachingOffer', fn ($query) => $query->where('title', 'like', "%{$search}%"))
                        ->orWhereHas('classSession', fn ($query) => $query->where('title', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('last_message_at')
            ->limit(100)
            ->get();

        return Inertia::render('admin/conversations/index', [
            'conversations' => $conversations->map(fn (Conversation $conversation): array => $this->listPayload($conversation)),
            'filters' => $filters,
            'statuses' => Conversation::STATUSES,
            'types' => Conversation::TYPES,
        ]);
    }

    public function show(Conversation $conversation): Response
    {
        $conversation->load([
            'participants.user:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
            'messages.sender:id,name,email,avatar_path,avatar_url',
            'teachingOffer:id,title,slug',
            'application:id,status,teaching_offer_id,student_user_id,teacher_user_id',
            'classSession:id,title,status,starts_at,ends_at,timezone',
            'reports.reporter:id,name,email',
            'reports.reportedUser:id,name,email',
            'reports.message:id,body,sender_user_id,created_at',
        ]);

        return Inertia::render('admin/conversations/show', [
            'conversation' => [
                ...$this->listPayload($conversation),
                'close_reason' => $conversation->close_reason,
                'participants' => $conversation->participants->map(fn ($participant): array => [
                    'id' => $participant->id,
                    'role' => $participant->role,
                    'user' => $participant->user,
                    'last_read_at' => $participant->last_read_at,
                    'archived_at' => $participant->archived_at,
                ])->values(),
                'messages' => $conversation->messages->map(fn ($message): array => [
                    'id' => $message->id,
                    'body' => $message->body,
                    'system_message' => $message->system_message,
                    'created_at' => $message->created_at,
                    'sender' => $message->sender,
                ])->values(),
                'reports' => $conversation->reports,
            ],
            'statuses' => Conversation::STATUSES,
        ]);
    }

    public function update(Request $request, Conversation $conversation): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', 'string', Rule::in(['close', 'reopen'])],
            'close_reason' => ['nullable', 'string', 'max:255'],
        ]);

        if ($data['action'] === 'close') {
            $this->conversations->close($conversation, $request->user(), $data['close_reason'] ?? null);
        } else {
            $this->conversations->reopen($conversation);
        }

        return back()->with('status', __('ui.admin_conversations.updated'));
    }

    /**
     * @return array<string, mixed>
     */
    private function listPayload(Conversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'status' => $conversation->status,
            'subject' => $conversation->subject,
            'last_message_at' => $conversation->last_message_at,
            'reports_count' => $conversation->reports_count ?? $conversation->reports->count(),
            'participants' => $conversation->participants->map(fn ($participant): array => [
                'id' => $participant->id,
                'role' => $participant->role,
                'user' => $participant->user,
            ])->values(),
            'last_message' => $conversation->latestMessage ? [
                'body' => $conversation->latestMessage->body,
                'sender_name' => $conversation->latestMessage->sender?->name,
                'created_at' => $conversation->latestMessage->created_at,
                'system_message' => $conversation->latestMessage->system_message,
            ] : null,
            'context' => [
                'offer' => $conversation->teachingOffer,
                'session' => $conversation->classSession,
            ],
        ];
    }
}

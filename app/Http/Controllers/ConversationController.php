<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\ConversationReport;
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
            'search' => $request->string('search')->toString(),
            'filter' => $request->string('filter')->toString() ?: 'all',
        ];

        $query = Conversation::query()
            ->whereHas('participants', fn ($query) => $query->where('user_id', $request->user()->id))
            ->with([
                'participants.user:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
                'latestMessage.sender:id,name,avatar_path,avatar_url',
                'teachingOffer:id,title,slug',
                'classSession:id,title,status,starts_at',
                'application:id,status',
            ])
            ->when($filters['filter'] !== 'archived', fn ($query) => $query->whereHas('participants', fn ($query) => $query
                ->where('user_id', $request->user()->id)
                ->whereNull('archived_at')))
            ->when($filters['filter'] === 'archived', fn ($query) => $query->whereHas('participants', fn ($query) => $query
                ->where('user_id', $request->user()->id)
                ->whereNotNull('archived_at')))
            ->when($filters['filter'] === 'applications', fn ($query) => $query->where('type', Conversation::TYPE_APPLICATION))
            ->when($filters['filter'] === 'sessions', fn ($query) => $query->where('type', Conversation::TYPE_SESSION))
            ->when($filters['search'], function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query
                        ->where('subject', 'like', "%{$search}%")
                        ->orWhereHas('users', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('teachingOffer', fn ($query) => $query->where('title', 'like', "%{$search}%"))
                        ->orWhereHas('classSession', fn ($query) => $query->where('title', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('last_message_at')
            ->orderByDesc('updated_at');

        $conversations = $query->get()
            ->map(fn (Conversation $conversation): array => $this->conversationListPayload($conversation, $request))
            ->when($filters['filter'] === 'unread', fn ($items) => $items->filter(fn (array $conversation): bool => $conversation['unread_count'] > 0)->values());

        return Inertia::render('messages/index', [
            'conversations' => $conversations,
            'filters' => $filters,
        ]);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $this->authorizeParticipant($request, $conversation);
        $this->conversations->markRead($conversation, $request->user());

        $conversation->load([
            'participants.user:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
            'messages' => fn ($query) => $query
                ->whereNull('deleted_at')
                ->with([
                    'sender:id,name,avatar_path,avatar_url',
                    'replyTo.sender:id,name,avatar_path,avatar_url',
                ])
                ->orderBy('created_at'),
            'teachingOffer:id,title,slug',
            'classSession:id,title,status,starts_at,ends_at,timezone',
            'application:id,status,teaching_offer_id',
            'reports:id,conversation_id,message_id,reporter_user_id,type,status,priority,created_at',
        ]);

        return Inertia::render('messages/show', [
            'conversation' => $this->conversationDetailPayload($conversation, $request),
            'reportTypes' => ConversationReport::TYPES,
            'messages' => [
                'unread_count' => $this->conversations->unreadCountFor($request->user()),
            ],
        ]);
    }

    public function store(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorizeParticipant($request, $conversation);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'reply_to_message_id' => [
                'nullable',
                'integer',
                Rule::exists('conversation_messages', 'id')
                    ->where('conversation_id', $conversation->id)
                    ->where('system_message', false)
                    ->whereNull('deleted_at'),
            ],
        ]);

        $replyTo = isset($data['reply_to_message_id'])
            ? ConversationMessage::query()->find($data['reply_to_message_id'])
            : null;

        $this->conversations->sendMessage($conversation, $request->user(), $data['body'], $replyTo);

        return back()->with('status', __('ui.messages.sent'));
    }

    public function read(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorizeParticipant($request, $conversation);
        $this->conversations->markRead($conversation, $request->user());

        return back()->with('status', __('ui.messages.marked_read'));
    }

    public function archive(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorizeParticipant($request, $conversation);
        $this->conversations->archiveForUser($conversation, $request->user());

        return redirect()->route('messages.index')->with('status', __('ui.messages.archived'));
    }

    public function report(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorizeParticipant($request, $conversation);

        $data = $request->validate([
            'type' => ['required', 'string', Rule::in(ConversationReport::TYPES)],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->conversations->report($conversation, $request->user(), $data);

        return back()->with('status', __('ui.messages.report_submitted'));
    }

    public function reportMessage(Request $request, Conversation $conversation, ConversationMessage $message): RedirectResponse
    {
        $this->authorizeParticipant($request, $conversation);

        $data = $request->validate([
            'type' => ['required', 'string', Rule::in(ConversationReport::TYPES)],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $this->conversations->report($conversation, $request->user(), $data, $message);

        return back()->with('status', __('ui.messages.report_submitted'));
    }

    private function authorizeParticipant(Request $request, Conversation $conversation): void
    {
        abort_unless($conversation->participants()->where('user_id', $request->user()->id)->exists(), 403);
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationListPayload(Conversation $conversation, Request $request): array
    {
        $participant = $conversation->participants->firstWhere('user_id', $request->user()->id);
        $otherParticipants = $conversation->participants
            ->reject(fn ($participant) => $participant->user_id === $request->user()->id)
            ->values();

        return [
            'id' => $conversation->id,
            'type' => $conversation->type,
            'status' => $conversation->status,
            'subject' => $conversation->subject,
            'last_message_at' => $conversation->last_message_at,
            'archived_at' => $participant?->archived_at,
            'unread_count' => $this->unreadCount($conversation, $request),
            'other_participants' => $otherParticipants->map(fn ($participant): array => $this->participantPayload($participant))->values(),
            'last_message' => $conversation->latestMessage ? [
                'body' => $conversation->latestMessage->body,
                'system_message' => $conversation->latestMessage->system_message,
                'sender_name' => $conversation->latestMessage->sender?->name,
                'created_at' => $conversation->latestMessage->created_at,
            ] : null,
            'context' => $this->contextPayload($conversation),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationDetailPayload(Conversation $conversation, Request $request): array
    {
        return [
            ...$this->conversationListPayload($conversation, $request),
            'can_send' => $conversation->isOpen() && ! $request->user()->isRestricted(),
            'close_reason' => $conversation->close_reason,
            'participants' => $conversation->participants->map(fn ($participant): array => $this->participantPayload($participant))->values(),
            'messages' => $conversation->messages->map(fn (ConversationMessage $message): array => [
                'id' => $message->id,
                'body' => $message->body,
                'system_message' => $message->system_message,
                'created_at' => $message->created_at,
                'reply_to_message' => $message->replyTo ? [
                    'id' => $message->replyTo->id,
                    'body' => $message->replyTo->body,
                    'sender' => $message->replyTo->sender ? [
                        'id' => $message->replyTo->sender->id,
                        'name' => $message->replyTo->sender->name,
                    ] : null,
                ] : null,
                'sender' => $message->sender ? [
                    'id' => $message->sender->id,
                    'name' => $message->sender->name,
                    'avatar' => $message->sender->avatar,
                ] : null,
            ])->values(),
            'reports' => $conversation->reports,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function participantPayload($participant): array
    {
        return [
            'id' => $participant->id,
            'role' => $participant->role,
            'last_read_at' => $participant->last_read_at,
            'archived_at' => $participant->archived_at,
            'user' => $participant->user ? [
                'id' => $participant->user->id,
                'name' => $participant->user->name,
                'avatar' => $participant->user->avatar,
                'is_restricted' => $participant->user->isRestricted(),
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function contextPayload(Conversation $conversation): array
    {
        return [
            'offer' => $conversation->teachingOffer ? [
                'id' => $conversation->teachingOffer->id,
                'title' => $conversation->teachingOffer->title,
                'slug' => $conversation->teachingOffer->slug,
            ] : null,
            'application' => $conversation->application ? [
                'id' => $conversation->application->id,
                'status' => $conversation->application->status,
            ] : null,
            'session' => $conversation->classSession ? [
                'id' => $conversation->classSession->id,
                'title' => $conversation->classSession->title,
                'status' => $conversation->classSession->status,
                'starts_at' => $conversation->classSession->starts_at,
                'ends_at' => $conversation->classSession->ends_at,
                'timezone' => $conversation->classSession->timezone,
            ] : null,
        ];
    }

    private function unreadCount(Conversation $conversation, Request $request): int
    {
        $participant = $conversation->participants->firstWhere('user_id', $request->user()->id);

        if (! $participant) {
            return 0;
        }

        return $conversation->messages()
            ->whereNull('deleted_at')
            ->where('system_message', false)
            ->where('sender_user_id', '!=', $request->user()->id)
            ->when($participant->last_read_at, fn ($query) => $query->where('created_at', '>', $participant->last_read_at))
            ->count();
    }
}

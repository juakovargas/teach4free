<?php

namespace App\Services;

use App\Models\ClassSession;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\ConversationParticipant;
use App\Models\ConversationReport;
use App\Models\Incident;
use App\Models\TeachingOfferApplication;
use App\Models\User;
use App\Notifications\ConversationReportSubmittedNotification;
use App\Notifications\NewConversationMessageNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConversationService
{
    public function ensureApplicationConversation(TeachingOfferApplication $application): Conversation
    {
        $application->loadMissing(['offer:id,title,slug', 'student:id,name', 'teacher:id,name']);

        $conversation = Conversation::query()->firstOrCreate(
            [
                'type' => Conversation::TYPE_APPLICATION,
                'teaching_offer_application_id' => $application->id,
            ],
            [
                'teaching_offer_id' => $application->teaching_offer_id,
                'class_session_id' => null,
                'subject' => __('ui.messages.application_subject', [
                    'offer' => $application->offer->title,
                ], 'en'),
                'status' => Conversation::STATUS_OPEN,
                'last_message_at' => now(),
                'created_by_user_id' => $application->student_user_id,
            ],
        );

        $this->ensureParticipant($conversation, $application->student, ConversationParticipant::ROLE_LEARNER);
        $this->ensureParticipant($conversation, $application->teacher, ConversationParticipant::ROLE_TEACHER);

        return $conversation->refresh();
    }

    public function ensureSessionConversation(ClassSession $session): Conversation
    {
        $session->loadMissing(['offer:id,title,slug', 'teacher:id,name', 'attendees.user:id,name']);

        $conversation = Conversation::query()->firstOrCreate(
            ['class_session_id' => $session->id],
            [
                'type' => Conversation::TYPE_SESSION,
                'teaching_offer_id' => $session->teaching_offer_id,
                'teaching_offer_application_id' => $session->application_id,
                'subject' => __('ui.messages.session_subject', [
                    'session' => $session->title,
                ], 'en'),
                'status' => Conversation::STATUS_OPEN,
                'last_message_at' => now(),
                'created_by_user_id' => $session->teacher_user_id,
            ],
        );

        $this->ensureParticipant($conversation, $session->teacher, ConversationParticipant::ROLE_TEACHER);

        foreach ($session->attendees as $attendance) {
            if ($attendance->user) {
                $this->ensureParticipant($conversation, $attendance->user, ConversationParticipant::ROLE_LEARNER);
            }
        }

        return $conversation->refresh();
    }

    public function addSystemMessage(Conversation $conversation, string $body): ConversationMessage
    {
        $message = ConversationMessage::create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => null,
            'body' => $body,
            'system_message' => true,
        ]);

        $conversation->forceFill([
            'last_message_at' => $message->created_at,
        ])->save();

        return $message;
    }

    public function sendMessage(Conversation $conversation, User $sender, string $body): ConversationMessage
    {
        if ($sender->isRestricted()) {
            throw ValidationException::withMessages([
                'body' => __('ui.messages.restricted_error'),
            ]);
        }

        if (! $conversation->isOpen()) {
            throw ValidationException::withMessages([
                'body' => __('ui.messages.closed_error'),
            ]);
        }

        abort_unless($this->isParticipant($conversation, $sender), 403);

        return DB::transaction(function () use ($conversation, $sender, $body): ConversationMessage {
            $message = ConversationMessage::create([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $sender->id,
                'body' => $body,
                'system_message' => false,
            ]);

            $conversation->forceFill([
                'last_message_at' => $message->created_at,
                'status' => $conversation->status === Conversation::STATUS_ARCHIVED
                    ? Conversation::STATUS_OPEN
                    : $conversation->status,
            ])->save();

            $this->markRead($conversation, $sender);
            $this->notifyRecipients($message, $sender);

            return $message;
        });
    }

    public function markRead(Conversation $conversation, User $user): void
    {
        $participant = $conversation->participants()
            ->where('user_id', $user->id)
            ->first();

        abort_unless($participant, 403);

        $participant->forceFill([
            'last_read_at' => now(),
            'archived_at' => null,
        ])->save();

        $conversation->messages()
            ->where('sender_user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function archiveForUser(Conversation $conversation, User $user): void
    {
        $participant = $conversation->participants()
            ->where('user_id', $user->id)
            ->first();

        abort_unless($participant, 403);

        $participant->forceFill(['archived_at' => now()])->save();
    }

    /**
     * @param  array{type: string, description?: string|null}  $data
     */
    public function report(Conversation $conversation, User $reporter, array $data, ?ConversationMessage $message = null): ConversationReport
    {
        abort_unless($this->isParticipant($conversation, $reporter), 403);

        if ($message && $message->conversation_id !== $conversation->id) {
            abort(404);
        }

        $reportedUser = $this->reportedUser($conversation, $reporter, $message);

        return DB::transaction(function () use ($conversation, $reporter, $data, $message, $reportedUser): ConversationReport {
            $report = ConversationReport::create([
                'conversation_id' => $conversation->id,
                'message_id' => $message?->id,
                'reporter_user_id' => $reporter->id,
                'reported_user_id' => $reportedUser?->id,
                'type' => $data['type'],
                'status' => ConversationReport::STATUS_OPEN,
                'priority' => ConversationReport::defaultPriorityFor($data['type']),
                'description' => $data['description'] ?? null,
            ]);

            $conversation->forceFill(['status' => Conversation::STATUS_REPORTED])->save();
            $this->createIncidentFor($report);
            $this->notifyAdmins($report);

            return $report;
        });
    }

    public function close(Conversation $conversation, User $admin, ?string $reason): void
    {
        $conversation->forceFill([
            'status' => Conversation::STATUS_CLOSED,
            'closed_at' => now(),
            'closed_by_user_id' => $admin->id,
            'close_reason' => $reason,
        ])->save();
    }

    public function reopen(Conversation $conversation): void
    {
        $conversation->forceFill([
            'status' => Conversation::STATUS_OPEN,
            'closed_at' => null,
            'closed_by_user_id' => null,
            'close_reason' => null,
        ])->save();
    }

    public function unreadCountFor(User $user): int
    {
        return ConversationParticipant::query()
            ->where('user_id', $user->id)
            ->whereNull('archived_at')
            ->whereHas('conversation.messages', function ($query) {
                $query->whereNull('deleted_at');
            })
            ->with('conversation:id')
            ->get()
            ->sum(fn (ConversationParticipant $participant): int => $this->unreadCountForParticipant($participant));
    }

    public function unreadCountForParticipant(ConversationParticipant $participant): int
    {
        return $participant->conversation
            ->messages()
            ->whereNull('deleted_at')
            ->where('system_message', false)
            ->where('sender_user_id', '!=', $participant->user_id)
            ->when(
                $participant->last_read_at,
                fn ($query) => $query->where('created_at', '>', $participant->last_read_at),
                fn ($query) => $query,
            )
            ->count();
    }

    private function ensureParticipant(Conversation $conversation, ?User $user, string $role): void
    {
        if (! $user) {
            return;
        }

        ConversationParticipant::firstOrCreate(
            [
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
            ],
            [
                'role' => $role,
                'last_read_at' => null,
            ],
        );
    }

    private function isParticipant(Conversation $conversation, User $user): bool
    {
        return $conversation->participants()
            ->where('user_id', $user->id)
            ->exists();
    }

    private function notifyRecipients(ConversationMessage $message, User $sender): void
    {
        $message->loadMissing('conversation.participants.user');

        foreach ($message->conversation->participants as $participant) {
            $recipient = $participant->user;

            if (! $recipient || $recipient->id === $sender->id || $recipient->isRestricted()) {
                continue;
            }

            $recipient->notify(new NewConversationMessageNotification($message));
        }
    }

    private function reportedUser(Conversation $conversation, User $reporter, ?ConversationMessage $message): ?User
    {
        if ($message?->sender_user_id && $message->sender_user_id !== $reporter->id) {
            return $message->sender;
        }

        /** @var Collection<int, User> $others */
        $others = $conversation->users()
            ->where('users.id', '!=', $reporter->id)
            ->get();

        return $others->count() === 1 ? $others->first() : null;
    }

    private function createIncidentFor(ConversationReport $report): void
    {
        $conversation = $report->conversation()->with(['teachingOffer', 'application', 'classSession'])->first();
        $incidentType = match ($report->type) {
            ConversationReport::TYPE_PAYMENT_REQUEST => Incident::TYPE_PAYMENT_REQUEST,
            ConversationReport::TYPE_COMMERCIAL_PRESSURE => Incident::TYPE_COMMERCIAL_PRESSURE,
            ConversationReport::TYPE_SPAM,
            ConversationReport::TYPE_UNSAFE_LINK => Incident::TYPE_SPAM,
            ConversationReport::TYPE_ABUSE,
            ConversationReport::TYPE_HARASSMENT,
            ConversationReport::TYPE_PRIVACY_ISSUE => Incident::TYPE_ABUSE,
            default => Incident::TYPE_OTHER,
        };

        Incident::create([
            'reporter_user_id' => $report->reporter_user_id,
            'reported_user_id' => $report->reported_user_id,
            'teaching_offer_id' => $conversation?->teaching_offer_id,
            'application_id' => $conversation?->teaching_offer_application_id,
            'class_session_id' => $conversation?->class_session_id,
            'type' => $incidentType,
            'status' => Incident::STATUS_OPEN,
            'priority' => $report->priority,
            'subject' => __('ui.messages.incident_subject', [
                'id' => $report->id,
            ], 'en'),
            'description' => $report->description ?: __('ui.messages.incident_description', [
                'subject' => $conversation?->subject ?: '',
            ], 'en'),
        ]);
    }

    private function notifyAdmins(ConversationReport $report): void
    {
        User::query()
            ->where('role', User::ROLE_ADMIN)
            ->whereNull('banned_at')
            ->whereNull('blocked_at')
            ->get()
            ->each(fn (User $admin) => $admin->notify(new ConversationReportSubmittedNotification($report)));
    }
}

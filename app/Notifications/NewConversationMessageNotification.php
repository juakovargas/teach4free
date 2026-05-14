<?php

namespace App\Notifications;

use App\Models\ConversationMessage;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class NewConversationMessageNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly ConversationMessage $message)
    {
        $this->message->loadMissing(['conversation', 'sender']);
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if ($notifiable instanceof User && ! $notifiable->isRestricted() && $notifiable->wantsEmailNotification('email_new_message_enabled')) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->payload($notifiable);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $locale = $notifiable->preferred_locale ?? config('app.locale');
        $payload = $this->payload($notifiable, $locale);

        return (new MailMessage)
            ->subject(__('ui.messages.mail_subject', [
                'subject' => $payload['conversation_subject'],
            ], $locale))
            ->greeting(__('ui.notifications.mail_greeting', [], $locale))
            ->line(__('ui.messages.mail_intro', [
                'sender' => $payload['sender_name'],
            ], $locale))
            ->line($payload['message_excerpt'])
            ->action(__('ui.messages.open_conversation', [], $locale), $payload['action_url'])
            ->line(__('ui.messages.mail_footer', [], $locale));
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(object $notifiable, ?string $locale = null): array
    {
        $locale ??= $notifiable->preferred_locale ?? config('app.locale');
        $conversation = $this->message->conversation;
        $sender = $this->message->sender;
        $subject = $conversation->subject ?: __('ui.messages.untitled_conversation', [], $locale);

        return [
            'event' => 'new_conversation_message',
            'title' => __('ui.messages.notification_title', [
                'sender' => $sender?->name ?? __('ui.messages.system_sender', [], $locale),
            ], $locale),
            'message' => __('ui.messages.notification_message', [
                'subject' => $subject,
            ], $locale),
            'action_url' => route('messages.show', $conversation),
            'conversation_id' => $conversation->id,
            'message_id' => $this->message->id,
            'sender_id' => $sender?->id,
            'sender_name' => $sender?->name ?? __('ui.messages.system_sender', [], $locale),
            'conversation_subject' => $subject,
            'message_excerpt' => Str::limit(strip_tags($this->message->body), 180),
        ];
    }
}

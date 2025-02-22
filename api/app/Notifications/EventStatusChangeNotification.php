<?php

namespace App\Notifications;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventStatusChangeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $event;
    protected $participant;
    protected $oldStatus;
    protected $newStatus;

    public function __construct(Event $event, EventParticipant $participant, string $oldStatus, string $newStatus)
    {
        $this->event = $event;
        $this->participant = $participant;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Event Registration Status Update - {$this->event->title}")
            ->view('emails.event.status-change', [
                'event' => $this->event,
                'participant' => $this->participant,
                'oldStatus' => $this->oldStatus,
                'newStatus' => $this->newStatus,
                'user' => $notifiable
            ]);
    }

    public function toDatabase($notifiable): array
    {
        return [
            'event_id' => $this->event->id,
            'message' => "Your registration status for {$this->event->title} has been updated to {$this->newStatus}",
            'type' => 'event_status_change'
        ];
    }
}

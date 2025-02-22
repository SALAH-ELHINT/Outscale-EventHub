<?php

namespace App\Notifications;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventUnregistrationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $event;
    protected $participant;

    public function __construct(Event $event, EventParticipant $participant)
    {
        $this->event = $event;
        $this->participant = $participant;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Event Registration Cancelled - {$this->event->title}")
            ->view('emails.event.unregistration', [
                'event' => $this->event,
                'participant' => $this->participant,
                'user' => $notifiable
            ]);
    }

    public function toDatabase($notifiable): array
    {
        return [
            'event_id' => $this->event->id,
            'message' => "Your registration for {$this->event->title} has been cancelled",
            'type' => 'event_unregistration'
        ];
    }
}

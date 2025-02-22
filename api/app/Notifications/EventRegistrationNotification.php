<?php

namespace App\Notifications;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EventRegistrationNotification extends Notification implements ShouldQueue
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
            ->subject("Registration Confirmation - {$this->event->title}")
            ->view('emails.event.registration', [
                'event' => $this->event,
                'participant' => $this->participant,
                'user' => $notifiable
            ]);
    }

    public function toDatabase($notifiable): array
    {
        return [
            'event_id' => $this->event->id,
            'message' => "You have registered for {$this->event->title}",
            'type' => 'event_registration'
        ];
    }
}

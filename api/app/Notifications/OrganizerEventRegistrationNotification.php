<?php

namespace App\Notifications;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrganizerEventRegistrationNotification extends Notification implements ShouldQueue
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
            ->subject("New Registration - {$this->event->title}")
            ->view('emails.event.organizer.new-registration', [
                'event' => $this->event,
                'participant' => $this->participant,
                'organizer' => $notifiable
            ]);
    }

    public function toDatabase($notifiable): array
    {
        return [
            'event_id' => $this->event->id,
            'message' => "New registration for {$this->event->title} by {$this->participant->user->email}",
            'type' => 'new_registration'
        ];
    }
}

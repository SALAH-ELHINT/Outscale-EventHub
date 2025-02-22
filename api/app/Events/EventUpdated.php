<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EventUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $eventId;
    public $type;
    public $data;

    public function __construct($eventId, $type, $data = [])
    {
        $this->eventId = $eventId;
        $this->type = $type;
        $this->data = $data;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('event.' . $this->eventId);
    }

    public function broadcastAs()
    {
        return 'event.updated';
    }

    public function broadcastWith()
    {
        return [
            'event_id' => $this->eventId,
            'type' => $this->type,
            'data' => $this->data,
            'timestamp' => now()->toISOString()
        ];
    }
}


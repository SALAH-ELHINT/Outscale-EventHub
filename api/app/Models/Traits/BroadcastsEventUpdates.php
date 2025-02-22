<?php

namespace App\Models\Traits;

use App\Events\EventUpdated;

trait BroadcastsEventUpdates
{
    public function broadcastEventUpdate($type, $additionalData = [])
    {
        broadcast(new EventUpdated($this->id, $type, $additionalData))->toOthers();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventParticipant extends BaseModel
{
    public static $cacheKey = 'event_participants';

    protected $fillable = [
        'event_id',
        'user_id',
        'status',
        'registration_date'
    ];

    protected $casts = [
        'registration_date' => 'datetime'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rules($id = null)
    {
        return [
            'event_id' => 'required|exists:events,id',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|in:pending,confirmed,cancelled,attended',
            'registration_date' => 'required|date'
        ];
    }
}

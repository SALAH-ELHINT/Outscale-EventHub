<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventRating extends BaseModel
{
    public static $cacheKey = 'event_ratings';

    protected $fillable = [
        'event_id',
        'user_id',
        'rating',
        'comment'
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
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string'
        ];
    }
}

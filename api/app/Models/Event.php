<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Traits\BroadcastsEventUpdates;

class Event extends BaseModel
{
    use SoftDeletes, BroadcastsEventUpdates;

    public static $cacheKey = 'events';

    protected $fillable = [
        'title',
        'description',
        'location',
        'date',
        'start_time',
        'end_time',
        'max_participants',
        'current_participants',
        'organizer_id',
        'status',
        'image_id'
    ];

    protected $casts = [
        'date' => 'datetime',
        'start_time' => 'date:H:i',
        'end_time' => 'date:H:i',
        'max_participants' => 'integer',
        'current_participants' => 'integer',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function image()
    {
        return $this->belongsTo(Upload::class, 'image_id');
    }

    public function participants()
    {
        return $this->hasMany(EventParticipant::class);
    }

    public function categories()
    {
        return $this->belongsToMany(EventCategory::class, 'event_category_relationships', 'event_id', 'category_id');
    }

    public function comments()
    {
        return $this->hasMany(EventComment::class);
    }

    public function ratings()
    {
        return $this->hasMany(EventRating::class);
    }

    public function rules($id = null)
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'max_participants' => 'required|integer|min:1',
            'status' => 'required|in:draft,published,cancelled,completed',
            'image_id' => 'nullable|exists:uploads,id',
        ];
    }

    public function isFull()
    {
        return $this->current_participants >= $this->max_participants;
    }

    public function userRegistration()
    {
        return $this->hasOne(EventParticipant::class)->where('user_id', auth()->id());
    }
}

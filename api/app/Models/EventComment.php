<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventComment extends BaseModel
{
    use SoftDeletes;

    public static $cacheKey = 'event_comments';

    protected $fillable = [
        'event_id',
        'user_id',
        'content'
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
            'content' => 'required|string'
        ];
    }
}

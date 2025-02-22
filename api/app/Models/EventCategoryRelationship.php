<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventCategoryRelationship extends Model
{
    protected $table = 'event_category_relationships';

    protected $fillable = [
        'event_id',
        'category_id'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function category()
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    public function rules($id = null)
    {
        return [
            'event_id' => 'required|exists:events,id',
            'category_id' => 'required|exists:event_categories,id',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventCategory extends BaseModel
{    protected $table = 'event_categories';

    protected $fillable = [
        'name',
        'description'
    ];

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_category_relationships', 'category_id', 'event_id');
    }

    public function rules($id = null)
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ];
    }
}

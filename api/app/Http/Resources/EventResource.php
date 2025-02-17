<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'date' => $this->date->format('Y-m-d'),
            'start_time' => $this->start_time->format('H:i'),
            'end_time' => $this->end_time->format('H:i'),
            'max_participants' => $this->max_participants,
            'current_participants' => $this->current_participants,
            'status' => $this->status,
            'is_full' => $this->isFull(),
            'organizer' => new UserResource($this->whenLoaded('organizer')),
            'image' => new UploadResource($this->whenLoaded('image')),
            'categories' => EventCategoryResource::collection($this->whenLoaded('categories')),
            'participants_count' => $this->participants()->count(),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}

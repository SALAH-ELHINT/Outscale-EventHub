<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class EventResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $userId = Auth::id();
        $isAuthenticated = Auth::check();

        $baseArray = [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'date_info' => [
                'date' => $this->date ? $this->date->format('Y-m-d') : null,
                'start_time' => $this->start_time ? $this->start_time->format('H:i') : null,
                'end_time' => $this->end_time ? $this->end_time->format('H:i') : null,
                'duration_minutes' => ($this->start_time && $this->end_time)
                    ? $this->start_time->diffInMinutes($this->end_time)
                    : 0
            ],
            'location' => $this->location,
            'participation' => [
                'current' => $this->current_participants ?? 0,
                'maximum' => $this->max_participants ?? 0,
                'is_full' => method_exists($this, 'isFull') ? $this->isFull() : false,
                'availability_percentage' => ($this->max_participants ?? 0) > 0
                    ? round((($this->current_participants ?? 0) / $this->max_participants) * 100, 1)
                    : 0
            ],
            'status' => $this->status ?? 'draft',
            'organizer' => new UserResource($this->whenLoaded('organizer')),
            'image' => new UploadResource($this->whenLoaded('image')),
            'categories' => EventCategoryResource::collection($this->whenLoaded('categories')),
        ];

        if ($this->shouldIncludeEngagement()) {
            $baseArray['engagement'] = [
                'ratings' => [
                    'average' => $this->whenLoaded('ratings', function() {
                        return $this->ratings ? round($this->ratings->avg('rating'), 1) : 0;
                    }),
                    'count' => $this->whenLoaded('ratings', function() {
                        return $this->ratings ? $this->ratings->count() : 0;
                    }),
                    'user_rating' => $this->when($isAuthenticated, function() use($userId) {
                        return $this->whenLoaded('ratings', function() use($userId) {
                            return $this->ratings ? $this->ratings->where('user_id', $userId)->first() : null;
                        });
                    })
                ],
                'comments' => [
                    'recent' => EventCommentResource::collection(
                        $this->whenLoaded('comments', function() {
                            return $this->comments ? $this->comments->take(5) : collect();
                        })
                    ),
                    'user_comments' => $this->when($isAuthenticated, function() use($userId) {
                        return $this->whenLoaded('comments', function() use($userId) {
                            return $this->comments
                                ? EventCommentResource::collection($this->comments->where('user_id', $userId))
                                : collect();
                        });
                    })
                ]
            ];
        }

        if ($isAuthenticated) {
            $userParticipation = $this->whenLoaded('userRegistration', function() {
                return $this->userRegistration;
            });

            $canComment = $this->canUserComment($userId, $userParticipation);
            $canRate = $this->canUserRate($userId, $userParticipation);

            $baseArray['permissions'] = [
                'can_comment' => $canComment,
                'can_rate' => $canRate,
                'can_edit' => $userId === $this->organizer_id,
                'can_manage_participants' => $userId === $this->organizer_id,
            ];

            $baseArray['user_interaction'] = [
                'registration_status' => $this->when($userParticipation, function() use($userParticipation) {
                    return $userParticipation ? $userParticipation->status : null;
                }),
                'is_registered' => $this->when($userParticipation, function() use($userParticipation) {
                    return $userParticipation && $userParticipation->status && $userParticipation->status !== 'cancelled';
                }, false),
                'is_organizer' => $userId === $this->organizer_id,
                'has_rated' => $this->whenLoaded('ratings', function() use($userId) {
                    return $this->ratings ? $this->ratings->where('user_id', $userId)->isNotEmpty() : false;
                }, false)
            ];
        }

        return $baseArray;
    }

    protected function shouldIncludeEngagement(): bool
    {
        return $this->resource->relationLoaded('ratings') ||
               $this->resource->relationLoaded('comments');
    }

    protected function canUserComment($userId, $userParticipation): bool
    {
        if ($userId === $this->organizer_id) {
            return true;
        }

        if ($this->status !== 'published' && $this->status !== 'completed') {
            return false;
        }

        if (!$userParticipation || !$userParticipation->status) {
            return false;
        }

        return in_array($userParticipation->status, ['confirmed', 'attended']);
    }

    protected function canUserRate($userId, $userParticipation): bool
    {
        if ($userId === $this->organizer_id) {
            return false;
        }

        if ($this->status !== 'completed') {
            return false;
        }

        if (!$userParticipation || !$userParticipation->status) {
            return false;
        }

        return $userParticipation->status === 'attended';
    }
}

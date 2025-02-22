<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventRating;
use App\Http\Requests\Event\CreateRatingRequest;
use App\Http\Resources\EventRatingResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use DB;

class EventRatingController extends Controller
{
    public function index($eventId)
    {
        try {
            $event = Event::findOrFail($eventId);

            $ratings = $event->ratings()
                ->with('user')
                ->latest()
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventRatingResource::collection($ratings),
                    'meta' => [
                        'current_page' => $ratings->currentPage(),
                        'last_page' => $ratings->lastPage(),
                        'total_items' => $ratings->total(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in EventRatingController.index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function store($eventId, CreateRatingRequest $request)
    {
        try {
            return DB::transaction(function () use ($eventId, $request) {
                $event = Event::findOrFail($eventId);

                
                $existingRating = $event->ratings()
                    ->where('user_id', Auth::id())
                    ->first();

                if ($existingRating) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.already_rated')]
                    ], 400);
                }

                $rating = $event->ratings()->create([
                    'user_id' => Auth::id(),
                    'rating' => $request->rating,
                    'comment' => $request->comment
                ]);

                $rating->load('user');

                return response()->json([
                    'success' => true,
                    'message' => __('events.rating_added'),
                    'data' => [
                        'item' => new EventRatingResource($rating)
                    ]
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventRatingController.store: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function update($eventId, $ratingId, Request $request)
    {
        try {
            return DB::transaction(function () use ($eventId, $ratingId, $request) {
                
                $event = Event::findOrFail($eventId);

                
                $rating = EventRating::where([
                    'id' => $ratingId,
                    'event_id' => $eventId,
                    'user_id' => Auth::id()
                ])->first();

                if (!$rating) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.rating_not_found')]
                    ], 404);
                }

                
                $validated = $request->validate([
                    'rating' => 'required|integer|between:1,5',
                    'comment' => 'nullable|string|max:1000'
                ]);

                $rating->update($validated);
                $rating->load('user');

                return response()->json([
                    'success' => true,
                    'message' => __('events.rating_updated'),
                    'data' => [
                        'item' => new EventRatingResource($rating)
                    ]
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventRatingController.update: ' . $e->getMessage());
            Log::error($e->getTraceAsString()); 
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function destroy($eventId, $ratingId)
    {
        try {
            return DB::transaction(function () use ($eventId, $ratingId) {
                
                $event = Event::findOrFail($eventId);

                
                $rating = EventRating::where('id', $ratingId)
                    ->where('event_id', $eventId)
                    ->where(function($query) use ($event) {
                        $query->where('user_id', Auth::id())
                              ->orWhere('event_id', function($q) {
                                  $q->select('id')
                                    ->from('events')
                                    ->where('organizer_id', Auth::id());
                              });
                    })
                    ->first();

                if (!$rating) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.rating_not_found')]
                    ], 404);
                }

                $rating->delete();

                return response()->json([
                    'success' => true,
                    'message' => __('events.rating_deleted'),
                    'data' => [
                        'id' => $ratingId
                    ]
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventRatingController.destroy: ' . $e->getMessage());
            Log::error($e->getTraceAsString()); 
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }
}

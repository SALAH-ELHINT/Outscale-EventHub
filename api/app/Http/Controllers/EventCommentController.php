<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventComment;
use App\Http\Requests\Event\CreateCommentRequest;
use App\Http\Requests\Event\UpdateCommentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use DB;

class EventCommentController extends Controller
{
    /**
     * Get comments for an event
     */
    public function index($eventId, Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);

            $comments = EventComment::with('user')
                ->where('event_id', $eventId)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'comments' => $comments->items(),
                    'meta' => [
                        'current_page' => $comments->currentPage(),
                        'last_page' => $comments->lastPage(),
                        'total_items' => $comments->total(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in EventCommentController@index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    /**
     * Store a new comment for an event
     */
    public function store(CreateCommentRequest $request, $eventId)
    {
        try {
            return DB::transaction(function () use ($request, $eventId) {
                $event = Event::findOrFail($eventId);

                if (!$event->userRegistration && !$event->organizer_id === Auth::id()) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.must_be_participant_to_comment')]
                    ], 403);
                }

                $comment = EventComment::create([
                    'event_id' => $eventId,
                    'user_id' => Auth::id(),
                    'content' => $request->content
                ]);

                $comment->load('user');

                return response()->json([
                    'success' => true,
                    'data' => ['comment' => $comment],
                    'message' => __('events.comment_added')
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventCommentController@store: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    /**
     * Update an existing comment
     */
    public function update(UpdateCommentRequest $request, $eventId, $commentId)
    {
        try {
            return DB::transaction(function () use ($request, $eventId, $commentId) {
                $comment = EventComment::where('event_id', $eventId)
                    ->where('id', $commentId)
                    ->firstOrFail();

                if ($comment->user_id !== Auth::id()) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('common.permission_denied')]
                    ], 403);
                }

                $comment->update([
                    'content' => $request->content
                ]);

                $comment->load('user');

                return response()->json([
                    'success' => true,
                    'data' => ['comment' => $comment],
                    'message' => __('events.comment_updated')
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventCommentController@update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    /**
     * Delete a comment
     */
    public function destroy($eventId, $commentId)
    {
        try {
            return DB::transaction(function () use ($eventId, $commentId) {
                $comment = EventComment::where('event_id', $eventId)
                    ->where('id', $commentId)
                    ->firstOrFail();

                $event = Event::findOrFail($eventId);
                if ($comment->user_id !== Auth::id() && $event->organizer_id !== Auth::id()) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('common.permission_denied')]
                    ], 403);
                }

                $comment->delete();

                return response()->json([
                    'success' => true,
                    'message' => __('events.comment_deleted')
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventCommentController@destroy: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }
}

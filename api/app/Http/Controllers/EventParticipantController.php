<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;
use DB;
use App\Http\Resources\EventParticipantResource;

class EventParticipantController extends Controller
{
    protected $modelClass = EventParticipant::class;

    protected function getModelClass()
    {
        return $this->modelClass;
    }

    public function index($eventId, Request $request)
    {
        try {
            $event = Event::find($eventId);

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('events.not_found')]
                ], 404);
            }

            if ($event->organizer_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('common.permission_denied')]
                ], 403);
            }

            $query = $this->modelClass::where('event_id', $eventId)
                ->with(['user', 'event']);

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);

            $total = $query->count();
            $results = $query->skip(($page - 1) * $perPage)
                            ->take($perPage)
                            ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventParticipantResource::collection($results),
                    'meta' => [
                        'current_page' => (int)$page,
                        'last_page' => ceil($total / $perPage),
                        'total_items' => $total,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function show($eventId, $participantId)
    {
        try {
            $event = Event::find($eventId);

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('events.not_found')]
                ], 404);
            }

            if ($event->organizer_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('common.permission_denied')]
                ], 403);
            }

            $participant = $this->modelClass::where('event_id', $eventId)
                ->where('id', $participantId)
                ->with(['user', 'event'])
                ->first();

            if (!$participant) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('events.participant_not_found')]
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'item' => new EventParticipantResource($participant)
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function updateStatus($eventId, $participantId, Request $request)
    {
        try {
            return DB::transaction(function () use ($eventId, $participantId, $request) {
                $event = Event::find($eventId);

                if (!$event) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.not_found')]
                    ], 404);
                }

                if ($event->organizer_id !== Auth::id()) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('common.permission_denied')]
                    ], 403);
                }

                $request->validate(['status' => 'required|in:pending,confirmed,cancelled,attended']);

                $participant = $this->modelClass::where('event_id', $eventId)
                    ->where('id', $participantId)
                    ->first();

                if (!$participant) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.participant_not_found')]
                    ], 404);
                }

                $oldStatus = $participant->status;
                $participant->status = $request->status;
                $participant->save();

                if ($oldStatus !== 'confirmed' && $request->status === 'confirmed') {
                    $event->increment('current_participants');
                } elseif ($oldStatus === 'confirmed' && $request->status !== 'confirmed') {
                    $event->decrement('current_participants');
                }

                return response()->json([
                    'success' => true,
                    'message' => __('events.participant_status_updated')
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }
}

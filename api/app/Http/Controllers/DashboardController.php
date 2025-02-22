<?php

namespace App\Http\Controllers;

use App\Http\Resources\EventResource;
use App\Http\Resources\EventParticipantResource;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use DB;

class DashboardController extends Controller
{
    /**
     * Get events where the user is registered as a participant
     */
    public function getRegisteredEvents(Request $request)
    {
        try {
            $userId = Auth::id();
            $query = Event::with([
                'organizer:id,email',
                'categories:id,name',
                'image'
            ])
            ->whereHas('participants', function($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->withCount(['participants as registered_count' => function($query) {
                $query->where('status', 'confirmed');
            }]);


            if ($request->has('status')) {
                $query->whereHas('participants', function($query) use ($userId, $request) {
                    $query->where('user_id', $userId)
                          ->where('status', $request->status);
                });
            }


            $query->orderBy('date', 'asc')
                  ->orderBy('start_time', 'asc');

            $perPage = $request->input('per_page', 10);
            $events = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventResource::collection($events),
                    'meta' => [
                        'current_page' => $events->currentPage(),
                        'last_page' => $events->lastPage(),
                        'total_items' => $events->total(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController.getRegisteredEvents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    /**
     * Get events organized by the user
     */
    public function getOrganizedEvents(Request $request)
    {
        try {
            $query = Event::with([
                'categories:id,name',
                'image',
                'participants' => function($query) {
                    $query->with('user:id,email')
                         ->orderBy('registration_date', 'desc');
                }
            ])
            ->where('organizer_id', Auth::id());


            if ($request->has('status')) {
                $query->where('status', $request->status);
            }


            $query->orderBy('date', 'asc')
                  ->orderBy('start_time', 'asc');

            $perPage = $request->input('per_page', 10);
            $events = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventResource::collection($events),
                    'meta' => [
                        'current_page' => $events->currentPage(),
                        'last_page' => $events->lastPage(),
                        'total_items' => $events->total(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController.getOrganizedEvents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    /**
     * Get event statistics for the user
     */
    public function getEventStatistics()
    {
        try {
            $userId = Auth::id();


            $organizedStats = Event::where('organizer_id', $userId)
                ->select(
                    DB::raw('COUNT(*) as total_events'),
                    DB::raw('COUNT(CASE WHEN status = "published" THEN 1 END) as published_events'),
                    DB::raw('COUNT(CASE WHEN status = "draft" THEN 1 END) as draft_events'),
                    DB::raw('COUNT(CASE WHEN status = "completed" THEN 1 END) as completed_events'),
                    DB::raw('SUM(current_participants) as total_participants')
                )
                ->first();


            $participationStats = DB::table('event_participants')
                ->where('user_id', $userId)
                ->select(
                    DB::raw('COUNT(*) as total_registrations'),
                    DB::raw('COUNT(CASE WHEN status = "confirmed" THEN 1 END) as confirmed_registrations'),
                    DB::raw('COUNT(CASE WHEN status = "pending" THEN 1 END) as pending_registrations'),
                    DB::raw('COUNT(CASE WHEN status = "attended" THEN 1 END) as attended_events')
                )
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'organized' => [
                        'total_events' => $organizedStats->total_events,
                        'published_events' => $organizedStats->published_events,
                        'draft_events' => $organizedStats->draft_events,
                        'completed_events' => $organizedStats->completed_events,
                        'total_participants' => $organizedStats->total_participants ?? 0,
                    ],
                    'participation' => [
                        'total_registrations' => $participationStats->total_registrations,
                        'confirmed_registrations' => $participationStats->confirmed_registrations,
                        'pending_registrations' => $participationStats->pending_registrations,
                        'attended_events' => $participationStats->attended_events,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController.getEventStatistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    /**
     * Get participants for a specific event organized by the user
     */
    public function getEventParticipants($eventId, Request $request)
    {
        try {
            $event = Event::where('organizer_id', Auth::id())
                         ->findOrFail($eventId);

            $query = $event->participants()
                          ->with('user:id,email')
                          ->orderBy('registration_date', 'desc');


            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $perPage = $request->input('per_page', 10);
            $participants = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventParticipantResource::collection($participants),
                    'meta' => [
                        'current_page' => $participants->currentPage(),
                        'last_page' => $participants->lastPage(),
                        'total_items' => $participants->total(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController.getEventParticipants: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    /**
     * Get upcoming events for the user (both organized and registered)
     */
    public function getUpcomingEvents()
    {
        try {
            $userId = Auth::id();
            $today = now()->startOfDay();

            
            $with = [
                'organizer:id,email',
                'categories:id,name',
                'image',
                'userRegistration',  
                'ratings',          
                'comments',         
                'participants'
            ];

            
            $organizedEvents = Event::with($with)
                ->where('organizer_id', $userId)
                ->where('date', '>=', $today)
                ->where('status', 'published')
                ->orderBy('date', 'asc')
                ->orderBy('start_time', 'asc')
                ->take(5)
                ->get();

            
            $registeredEvents = Event::with($with)
                ->whereHas('participants', function($query) use ($userId) {
                    $query->where('user_id', $userId)
                          ->where('status', 'confirmed');
                })
                ->where('date', '>=', $today)
                ->where('status', 'published')
                ->orderBy('date', 'asc')
                ->orderBy('start_time', 'asc')
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'organized_events' => EventResource::collection($organizedEvents),
                    'registered_events' => EventResource::collection($registeredEvents)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController.getUpcomingEvents: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')],
                'debug' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}

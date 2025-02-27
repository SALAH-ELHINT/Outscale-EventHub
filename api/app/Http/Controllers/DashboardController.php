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
                'image',
                'ratings',
                'comments',
                'participants'
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
                        'currentPage' => $events->currentPage(),
                        'lastPage' => $events->lastPage(),
                        'totalItems' => $events->total(),
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
     * Get all events where user is a participant, including all statuses
     */
    public function getAllParticipantEvents(Request $request)
    {
        try {
            $userId = Auth::id();
            $query = Event::with([
                'organizer:id,email',
                'categories:id,name',
                'image',
                'ratings',
                'comments',
                'participants' => function($query) use ($userId) {
                    $query->where('user_id', $userId);
                },
                'userRegistration'
            ])
            ->whereHas('participants', function($query) use ($userId) {
                $query->where('user_id', $userId);
            });

            if ($request->has('eventStatus')) {
                $query->where('status', $request->eventStatus);
            }

            if ($request->has('participantStatus')) {
                $query->whereHas('participants', function($query) use ($userId, $request) {
                    $query->where('user_id', $userId)
                          ->where('status', $request->participantStatus);
                });
            }

            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('location', 'LIKE', "%{$searchTerm}%");
                });
            }

            if ($request->has('dateFrom')) {
                $query->where('date', '>=', $request->dateFrom);
            }
            if ($request->has('dateTo')) {
                $query->where('date', '<=', $request->dateTo);
            }

            $sortField = $request->input('sortBy', 'date');
            $sortOrder = $request->input('sortOrder', 'asc');
            $query->orderBy($sortField, $sortOrder);

            $perPage = $request->input('per_page', 10);
            $events = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventResource::collection($events),
                    'meta' => [
                        'currentPage' => $events->currentPage(),
                        'lastPage' => $events->lastPage(),
                        'totalItems' => $events->total(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController.getAllParticipantEvents: ' . $e->getMessage());
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
                'ratings',
                'comments',
                'participants' => function($query) {
                    $query->with('user:id,email')
                         ->orderBy('registration_date', 'desc');
                }
            ])
            ->where('organizer_id', Auth::id());

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('title', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('description', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('location', 'LIKE', "%{$searchTerm}%");
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
                        'currentPage' => $events->currentPage(),
                        'lastPage' => $events->lastPage(),
                        'totalItems' => $events->total(),
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

            $firstDayOfMonth = now()->startOfMonth();
            $lastDayOfMonth = now()->endOfMonth();

            $thisMonthRegistrations = DB::table('event_participants')
                ->where('user_id', $userId)
                ->whereBetween('registration_date', [$firstDayOfMonth, $lastDayOfMonth])
                ->count();

            $thisMonthCreations = Event::where('organizer_id', $userId)
                ->whereBetween('created_at', [$firstDayOfMonth, $lastDayOfMonth])
                ->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'organized' => [
                        'totalEvents' => $organizedStats->total_events,
                        'publishedEvents' => $organizedStats->published_events,
                        'draftEvents' => $organizedStats->draft_events,
                        'completedEvents' => $organizedStats->completed_events,
                        'totalParticipants' => $organizedStats->total_participants ?? 0,
                        'thisMonthCreations' => $thisMonthCreations
                    ],
                    'participation' => [
                        'totalRegistrations' => $participationStats->total_registrations,
                        'confirmedRegistrations' => $participationStats->confirmed_registrations,
                        'pendingRegistrations' => $participationStats->pending_registrations,
                        'attendedEvents' => $participationStats->attended_events,
                        'thisMonthRegistrations' => $thisMonthRegistrations
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

            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->whereHas('user', function($q) use ($searchTerm) {
                    $q->where('email', 'LIKE', "%{$searchTerm}%");
                });
            }

            $perPage = $request->input('per_page', 10);
            $participants = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventParticipantResource::collection($participants),
                    'meta' => [
                        'currentPage' => $participants->currentPage(),
                        'lastPage' => $participants->lastPage(),
                        'totalItems' => $participants->total(),
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

            $recentlyUpdatedEvents = Event::with($with)
                ->where(function($query) use ($userId) {
                    $query->where('organizer_id', $userId)
                        ->orWhereHas('participants', function($q) use ($userId) {
                            $q->where('user_id', $userId);
                        });
                })
                ->orderBy('updated_at', 'desc')
                ->take(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'organizedEvents' => EventResource::collection($organizedEvents),
                    'registeredEvents' => EventResource::collection($registeredEvents),
                    'recentlyUpdatedEvents' => EventResource::collection($recentlyUpdatedEvents)
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

    /**
     * Get activity summary for dashboard (recent activities)
     */
    public function getActivitySummary()
    {
        try {
            $userId = Auth::id();

            $recentRegistrations = DB::table('event_participants')
                ->join('users', 'event_participants.user_id', '=', 'users.id')
                ->join('events', 'event_participants.event_id', '=', 'events.id')
                ->where('events.organizer_id', $userId)
                ->where('event_participants.created_at', '>=', now()->subDays(30))
                ->select(
                    'event_participants.id',
                    'event_participants.event_id',
                    'event_participants.user_id',
                    'event_participants.status',
                    'event_participants.created_at',
                    'users.email as user_email',
                    'events.title as event_title'
                )
                ->orderBy('event_participants.created_at', 'desc')
                ->limit(10)
                ->get();

            $recentComments = DB::table('event_comments')
                ->join('users', 'event_comments.user_id', '=', 'users.id')
                ->join('events', 'event_comments.event_id', '=', 'events.id')
                ->where('events.organizer_id', $userId)
                ->where('event_comments.created_at', '>=', now()->subDays(30))
                ->select(
                    'event_comments.id',
                    'event_comments.event_id',
                    'event_comments.user_id',
                    'event_comments.content',
                    'event_comments.created_at',
                    'users.email as user_email',
                    'events.title as event_title'
                )
                ->orderBy('event_comments.created_at', 'desc')
                ->limit(10)
                ->get();

            $recentRatings = DB::table('event_ratings')
                ->join('users', 'event_ratings.user_id', '=', 'users.id')
                ->join('events', 'event_ratings.event_id', '=', 'events.id')
                ->where('events.organizer_id', $userId)
                ->where('event_ratings.created_at', '>=', now()->subDays(30))
                ->select(
                    'event_ratings.id',
                    'event_ratings.event_id',
                    'event_ratings.user_id',
                    'event_ratings.rating',
                    'event_ratings.created_at',
                    'users.email as user_email',
                    'events.title as event_title'
                )
                ->orderBy('event_ratings.created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'recentRegistrations' => $recentRegistrations,
                    'recentComments' => $recentComments,
                    'recentRatings' => $recentRatings
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in DashboardController.getActivitySummary: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }
}

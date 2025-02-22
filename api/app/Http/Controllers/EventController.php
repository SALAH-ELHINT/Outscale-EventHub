<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Enums\ROLE;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;
use DB;
use App\Http\Resources\EventResource;
use App\Models\Classes\DataTableParams;
use App\Notifications\EventRegistrationNotification;
use App\Notifications\EventStatusChangeNotification;
use App\Notifications\EventUnregistrationNotification;
use App\Notifications\OrganizerEventRegistrationNotification;
use App\Notifications\OrganizerEventUnregistrationNotification;
use App\Events\EventUpdated;

class EventController extends CrudController
{
    protected $table = 'events';
    protected $modelClass = Event::class;
    protected $restricted = ['create', 'update', 'delete'];

    protected function getTable()
    {
        return $this->table;
    }

    protected function getModelClass()
    {
        return $this->modelClass;
    }

    protected function getDatatableParams(Request $request): \App\Models\Classes\DataTableParams
    {
        $isPublicRoute = in_array($request->route()->getName(), ['events.index', 'events.show']);
        return new DataTableParams(
            $request->order,
            $request->filter,
            !$isPublicRoute
        );
    }

    protected function getReadAllQuery(): Builder
    {
        $query = parent::getReadAllQuery();


        if (!Auth::check()) {
            $query->where('status', 'published');
        } else if (!Auth::user()->hasRole(ROLE::ADMIN)) {
            $query->where(function ($q) {
                $q->where('status', 'published')
                    ->orWhere('organizer_id', Auth::id());
            });
        }

        return $query;
    }

    public function readAll(Request $request)
    {
        try {
            $userId = Auth::id();
            $query = $this->model()
                ->with([
                    'organizer:id,email',
                    'categories:id,name',
                    'image',
                    'participants' => function ($query) {
                        $query->with('user:id,email')
                            ->where('status', 'confirmed');
                    }
                ]);


            if (Auth::check()) {
                $query->with([
                    'userRegistration' => function ($query) use ($userId) {
                        $query->where('user_id', $userId);
                    }
                ]);
            }

            if (!Auth::check()) {
                $query->where('status', 'published');
            } else if (!Auth::user()->hasRole(ROLE::ADMIN)) {
                $query->where(function ($q) {
                    $q->where('status', 'published')
                        ->orWhere('organizer_id', Auth::id());
                });
            }

            if (!$request->has('order')) {
                $query->orderBy('date', 'asc')
                    ->orderBy('start_time', 'asc');
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
                        'items' => EventResource::collection($results),
                        'meta' => [
                                'current_page' => (int) $page,
                                'last_page' => ceil($total),
                                'total_items' => $total,
                            ]
                    ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in EventController.readAll: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ]);
        }
    }

    public function readOne($id, Request $request)
    {
        try {
            $userId = Auth::id();
            $query = $this->model()
                ->with([
                'organizer',
                'categories',
                'image',
                'participants' => function ($query) {
                    $query->with('user')
                        ->where('status', 'confirmed');
                },
                'comments' => function ($query) {
                    $query->with('user')
                        ->latest();
                },
                'ratings' => function ($query) {
                    $query->with('user');
                }
            ]);


            if (Auth::check()) {
                $query->with([
                    'userRegistration' => function ($query) use ($userId) {
                        $query->where('user_id', $userId);
                    }
                ]);
            }

            $event = $query->find($id);

            if (!$event) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('events.not_found')]
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'item' => new EventResource($event)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in EventController.readOne: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function createOne(Request $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $request->merge([
                    'organizer_id' => Auth::id(),
                    'current_participants' => 0
                ]);

                $result = parent::createOne($request);

                if ($request->has('categories')) {
                    $event = $this->model()->find($result->getData()->data->item->id);
                    $event->categories()->sync($request->categories);
                }

                return $result;
            });
        } catch (\Exception $e) {
            Log::error('Error in EventController.createOne: ' . $e->getMessage());
            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    protected function getEventDetails($event)
    {
        $userId = Auth::id();


        $event->load([
            'organizer',
            'categories',
            'image',
            'participants' => function ($query) {
                $query->with('user')
                    ->where('status', 'confirmed');
            },
            'comments' => function ($query) {
                $query->with('user')
                    ->latest()
                    ->take(5);
            },
            'ratings',
            'userRegistration' => function ($query) use ($userId) {
                $query->where('user_id', $userId);
            }
        ]);


        if (Auth::check()) {
            $event->loadCount([
                'participants as user_is_registered' => function ($query) use ($userId) {
                    $query->where('user_id', $userId)
                        ->where('status', '!=', 'cancelled');
                }
            ]);
        }


        $eventData = new EventResource($event);


        $additionalData = [];
        if (Auth::check()) {
            $additionalData = [
                'user_registration_status' => optional($event->userRegistration)->status,
                'is_registered' => (bool) $event->user_is_registered,
                'is_organizer' => Auth::id() === $event->organizer_id
            ];
        }

        return array_merge($eventData->resolve(), $additionalData);
    }

    public function register($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $event = $this->model()->find($id);

                if (!$event) {
                    return response()->json(['success' => false, 'errors' => [__('events.not_found')]]);
                }

                if ($event->isFull()) {
                    return response()->json(['success' => false, 'errors' => [__('events.is_full')]]);
                }

                $userId = Auth::id();
                $existingRegistration = $event->participants()
                    ->where('user_id', $userId)
                    ->first();

                if ($existingRegistration) {
                    if ($existingRegistration->status === 'cancelled') {
                        $existingRegistration->update([
                            'status' => 'pending',
                            'registration_date' => now()
                        ]);


                        $this->sendEventRegistrationNotification($event, $existingRegistration->fresh());
                    } else {
                        return response()->json(['success' => false, 'errors' => [__('events.already_registered')]]);
                    }
                } else {
                    $participant = $event->participants()->create([
                        'user_id' => $userId,
                        'status' => 'pending',
                        'registration_date' => now()
                    ]);


                    $this->sendEventRegistrationNotification($event, $participant);
                }

                $event = $event->fresh();
                $eventDetails = $this->getEventDetails($event);

                return response()->json([
                    'success' => true,
                    'message' => __('events.registration_success'),
                    'data' => [
                        'item' => $eventDetails
                    ]
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventController.register: ' . $e->getMessage());
            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    public function unregister($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $event = $this->model()->find($id);

                if (!$event) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.not_found')]
                    ], 404);
                }

                $userId = Auth::id();
                $participant = $event->participants()
                    ->where('user_id', $userId)
                    ->first();

                if (!$participant) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.not_registered')]
                    ], 404);
                }


                if ($participant->status === 'confirmed') {
                    $event->decrement('current_participants');
                }


                $participant->update(['status' => 'cancelled']);


                $this->sendEventUnregistrationNotification($event, $participant);


                $event = $event->fresh();
                $eventDetails = $this->getEventDetails($event);

                return response()->json([
                    'success' => true,
                    'message' => __('events.registration_cancelled'),
                    'data' => [
                        'item' => $eventDetails
                    ]
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventController.unregister: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $event = $this->model()->find($id);

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

                $event->delete();

                return response()->json([
                    'success' => true,
                    'message' => __('events.deleted_success')
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventController.destroy: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    protected function notifyEventUpdate(Event $event, string $type, $additionalData = [])
    {
        broadcast(new EventUpdated($event->id, $type, $additionalData))->toOthers();
    }

    protected function sendEventRegistrationNotification(Event $event, EventParticipant $participant)
    {

        $participant->user->notify(new EventRegistrationNotification($event, $participant));


        $event->organizer->notify(new OrganizerEventRegistrationNotification($event, $participant));
    }

    protected function sendEventStatusChangeNotification(Event $event, EventParticipant $participant, string $oldStatus)
    {

        $participant->user->notify(new EventStatusChangeNotification(
            $event,
            $participant,
            $oldStatus,
            $participant->status
        ));
    }

    protected function sendEventUnregistrationNotification(Event $event, EventParticipant $participant)
    {

        $participant->user->notify(new EventUnregistrationNotification($event, $participant));
        $event->organizer->notify(new OrganizerEventUnregistrationNotification($event, $participant));
    }

}

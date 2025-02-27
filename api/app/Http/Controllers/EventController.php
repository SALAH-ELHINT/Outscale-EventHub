<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\EventCategory;
use App\Enums\ROLE;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;
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
    protected $restricted = ['update', 'delete'];

    protected function getTable()
    {
        return $this->table;
    }

    protected function getModelClass()
    {
        return $this->modelClass;
    }

    protected function getDatatableParams(Request $request): DataTableParams
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
                $model = app($this->getModelClass());
                $customValidationMsgs = method_exists($model, 'validationMessages') ? $model->validationMessages() : [];
                $validated = $request->validate(app($this->getModelClass())->rules(), $customValidationMsgs);

                $validated['organizer_id'] = Auth::id();
                $validated['current_participants'] = 0;

                $model = $this->model()->create($validated);

                if ($request->has('categories')) {
                    $model->categories()->sync($request->categories);
                }

                if (method_exists($this, 'afterCreateOne')) {
                    $this->afterCreateOne($model, $request);
                }

                return response()->json([
                    'success' => true,
                    'data' => ['item' => $model],
                    'message' => __($this->getTable().'.created'),
                ]);
            });
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'errors' => Arr::flatten($e->errors())]);
        } catch (\Exception $e) {

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
            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function updateOne($id, Request $request)
    {
        try {
            return DB::transaction(function () use ($id, $request) {
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

                $model = app($this->getModelClass());
                $customValidationMsgs = method_exists($model, 'validationMessages') ? $model->validationMessages() : [];

                $rules = $model->rules($id);

                // Make most fields optional during update
                $rules['title'] = 'sometimes|string|max:255';
                $rules['description'] = 'sometimes|string';
                $rules['location'] = 'sometimes|string|max:255';
                $rules['date'] = 'sometimes|date|after_or_equal:today';
                $rules['start_time'] = 'sometimes|date_format:H:i';
                $rules['end_time'] = 'sometimes|date_format:H:i|after:start_time';
                $rules['max_participants'] = 'sometimes|integer|min:1';
                $rules['status'] = 'sometimes|in:draft,published,cancelled,completed';

                $rules['image_id'] = 'nullable|exists:uploads,id';
                $rules['categories'] = 'sometimes|array';
                $rules['categories.*'] = 'exists:event_categories,id';

                $validated = $request->validate($rules, $customValidationMsgs);

                // Ensure current_participants doesn't exceed max_participants if updated
                if (isset($validated['max_participants']) &&
                    $validated['max_participants'] < $event->current_participants) {
                    throw ValidationException::withMessages([
                        'max_participants' => [__('events.max_participants_too_low')]
                    ]);
                }

                // Update only the fields that are present in the request
                $event->fill($validated);
                $event->save();

                // Sync categories if provided
                if ($request->has('categories')) {
                    $event->categories()->sync($request->categories);
                }

                $this->notifyEventUpdate($event, 'updated');

                // Eager load all potential relations to prevent missing relations
                $event = $event->fresh([
                    'organizer',
                    'categories',
                    'image',
                    'participants.user',
                    'comments.user',
                    'ratings',
                    'userRegistration'
                ]);

                // Ensure status is not missing
                $event->status = $event->status ?? 'draft';

                // Create resource with default values for missing properties
                $eventResource = new EventResource($event);

                return response()->json([
                    'success' => true,
                    'data' => ['item' => $eventResource],
                    'message' => __('events.updated')
                ]);
            });
        } catch (ValidationException $e) {
            Log::error('Event Update Validation Error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'errors' => Arr::flatten($e->errors())
            ], 422);
        } catch (\Exception $e) {
            Log::error('Unexpected Error in Event Update: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }

    public function updateParticipantStatus($eventId, $participantId, Request $request)
    {
        try {
            return DB::transaction(function () use ($eventId, $participantId, $request) {
                $validated = $request->validate([
                    'status' => 'required|in:pending,confirmed,cancelled,attended'
                ]);

                $event = $this->model()->find($eventId);

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

                $participant = EventParticipant::where('id', $participantId)
                    ->where('event_id', $eventId)
                    ->first();

                if (!$participant) {
                    return response()->json([
                        'success' => false,
                        'errors' => [__('events.participant_not_found')]
                    ], 404);
                }

                $oldStatus = $participant->status;
                $newStatus = $validated['status'];

                $participant->status = $newStatus;
                $participant->save();

                if ($oldStatus !== 'confirmed' && $newStatus === 'confirmed') {
                    $event->increment('current_participants');
                } else if ($oldStatus === 'confirmed' && $newStatus !== 'confirmed') {
                    $event->decrement('current_participants');
                }

                $this->sendEventStatusChangeNotification($event, $participant, $oldStatus);

                $this->notifyEventUpdate($event, 'participant_status_updated', [
                    'participant_id' => $participant->id,
                    'old_status' => $oldStatus,
                    'new_status' => $newStatus
                ]);

                $participant->load('user');

                return response()->json([
                    'success' => true,
                    'data' => [
                        'participant' => $participant,
                        'event' => [
                            'id' => $event->id,
                            'current_participants' => $event->current_participants,
                            'max_participants' => $event->max_participants,
                        ]
                    ],
                    'message' => __('events.participant_status_updated')
                ]);
            });
        } catch (ValidationException $e) {
            return response()->json(['success' => false, 'errors' => Arr::flatten($e->errors())]);
        } catch (\Exception $e) {

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    public function edit($id, Request $request)
    {
        try {
            $event = $this->model()->with([
                'organizer',
                'categories',
                'image',
                'participants' => function ($query) {
                    $query->with('user:id,email')
                        ->orderBy('registration_date', 'desc');
                },
                'comments' => function ($query) {
                    $query->with('user')
                        ->latest();
                },
                'ratings' => function ($query) {
                    $query->with('user');
                },
                'userRegistration' => function ($query) {
                    $query->where('user_id', Auth::id());
                }
            ])->find($id);

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

            $allCategories = EventCategory::select('id', 'name', 'description')
                ->orderBy('name')
                ->get();

            $selectedCategoryIds = $event->categories->pluck('id')->toArray();

            $eventResource = new EventResource($event);

            return response()->json([
                'success' => true,
                'data' => [
                    'event' => $eventResource,
                    'categories' => [
                        'all' => $allCategories,
                        'selected' => $selectedCategoryIds
                    ],
                    'participants_count' => [
                        'total' => $event->participants->count(),
                        'confirmed' => $event->participants->where('status', 'confirmed')->count(),
                        'pending' => $event->participants->where('status', 'pending')->count(),
                        'cancelled' => $event->participants->where('status', 'cancelled')->count(),
                        'attended' => $event->participants->where('status', 'attended')->count()
                    ]
                ]
            ]);
        } catch (\Exception $e) {

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    public function getParticipants($id, Request $request)
    {
        try {
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

            $status = $request->input('status');
            $search = $request->input('search');
            $perPage = $request->input('per_page', 10);

            $query = $event->participants()->with('user');

            if ($status && $status !== 'all') {
                $query->where('status', $status);
            }

            if ($search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('email', 'like', "%{$search}%");
                });
            }

            $query->orderBy('registration_date', 'desc');

            if ($perPage === 'all') {
                $participants = $query->get();
                $currentPage = 1;
                $lastPage = 1;
                $total = $participants->count();
            } else {
                $participants = $query->paginate($perPage);
                $currentPage = $participants->currentPage();
                $lastPage = $participants->lastPage();
                $total = $participants->total();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $participants,
                    'meta' => [
                        'current_page' => $currentPage,
                        'last_page' => $lastPage,
                        'total_items' => $total,
                    ]
                ]
            ]);
        } catch (\Exception $e) {

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
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

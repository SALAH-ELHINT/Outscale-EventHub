<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use DB;

class EventController extends CrudController
{
    protected $table = 'events';
    protected $modelClass = Event::class;

    protected function getTable()
    {
        return $this->table;
    }

    protected function getModelClass()
    {
        return $this->modelClass;
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

                if ($event->participants()->where('user_id', $userId)->exists()) {
                    return response()->json(['success' => false, 'errors' => [__('events.already_registered')]]);
                }

                $event->participants()->create([
                    'user_id' => $userId,
                    'status' => 'pending',
                    'registration_date' => now()
                ]);

                $event->increment('current_participants');

                return response()->json([
                    'success' => true,
                    'message' => __('events.registration_success')
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Error in EventController.register: ' . $e->getMessage());
            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    public function updateParticipantStatus($eventId, $participantId, Request $request)
    {
        try {
            return DB::transaction(function () use ($eventId, $participantId, $request) {
                $event = $this->model()->find($eventId);

                if (!$event || $event->organizer_id !== Auth::id()) {
                    return response()->json(['success' => false, 'errors' => [__('common.permission_denied')]]);
                }

                $request->validate(['status' => 'required|in:confirmed,cancelled,attended']);

                $participant = $event->participants()->find($participantId);

                if (!$participant) {
                    return response()->json(['success' => false, 'errors' => [__('events.participant_not_found')]]);
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
            Log::error('Error in EventController.updateParticipantStatus: ' . $e->getMessage());
            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }
}

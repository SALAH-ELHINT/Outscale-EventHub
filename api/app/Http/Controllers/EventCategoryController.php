<?php

namespace App\Http\Controllers;

use App\Models\EventCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\EventCategoryResource;

class EventCategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $categories = EventCategory::select('id', 'name', 'description')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => EventCategoryResource::collection($categories)
                ]
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ], 500);
        }
    }
}

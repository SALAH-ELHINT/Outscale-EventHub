<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        $event = $this->route('event');
        return $event->organizer_id === auth()->id();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'location' => 'sometimes|required|string|max:255',
            'date' => 'sometimes|required|date|after:today',
            'start_time' => 'sometimes|required|date_format:H:i',
            'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
            'max_participants' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:draft,published,cancelled,completed',
            'image_id' => 'nullable|exists:uploads,id',
            'categories' => 'sometimes|array',
            'categories.*' => 'exists:event_categories,id'
        ];
    }
}

<?php

namespace App\Http\Requests\Event;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Event;

class CreateRatingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize()
    {
        $event = Event::findOrFail($this->route('id'));

        $participation = $event->participants()
            ->where('user_id', auth()->id())
            ->where('status', 'attended')
            ->first();

        if ($event->organizer_id === auth()->id()) {
            return false;
        }

        if ($event->status !== 'completed') {
            return false;
        }

        return $participation !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules()
    {
        return [
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000'
        ];
    }

    public function messages()
    {
        return [
            'rating.required' => 'A rating is required.',
            'rating.between' => 'Rating must be between 1 and 5.',
            'comment.max' => 'Comment cannot exceed 1000 characters.'
        ];
    }
}

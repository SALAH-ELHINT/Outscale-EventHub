<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|email|unique:users,email|max:191',
            'password' => 'required|string|min:8|max:191',
            'password_confirmation' => 'required|same:password',
        ];
    }

    protected function prepareForValidation()
    {
        Log::info('Registration request data:', [
            'original' => $this->all(),
            'has_password_confirmation' => $this->has('password_confirmation'),
            'has_passwordConfirmation' => $this->has('passwordConfirmation'),
        ]);

        if ($this->has('passwordConfirmation')) {
            $this->merge([
                'password_confirmation' => $this->input('passwordConfirmation')
            ]);
        }
    }

    public function messages()
    {
        return [
            'password_confirmation.required' => 'The password confirmation field is required.',
            'password_confirmation.same' => 'The password confirmation does not match.',
        ];
    }
}

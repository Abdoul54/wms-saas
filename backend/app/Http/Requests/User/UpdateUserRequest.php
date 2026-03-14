<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'username'  => "sometimes|string|max:50|unique:users,username,{$userId}",
            'firstname' => 'sometimes|string|max:100',
            'lastname'  => 'sometimes|string|max:100',
            'email'     => "sometimes|email|max:255|unique:users,email,{$userId}",
            'password'  => 'sometimes|string|min:8|confirmed',
            'role'      => 'sometimes|string|exists:roles,name',
        ];
    }
}

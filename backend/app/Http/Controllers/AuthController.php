<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    use ApiResponse;

    public function __construct(private AuthService $service) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $this->service->register($request->validated());

        return $this->success('Account created successfully.', $data, 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {

        Log::info([
            'email' =>        $request->email,
            'password' => $request->password
        ]);

        $data = $this->service->login(
            $request->email,
            $request->password
        );

        return $this->success('Logged in successfully.', $data);
    }

    public function refresh(Request $request): JsonResponse
    {
        $request->validate(['refresh_token' => 'required|string']);

        $data = $this->service->refresh($request->refresh_token);

        return $this->success('Token refreshed successfully.', $data);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success('Authenticated user.', new UserResource($request->user()->load('roles')));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->service->logout($request->user());

        return $this->success('Logged out successfully.');
    }
}

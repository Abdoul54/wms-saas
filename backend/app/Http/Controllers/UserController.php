<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private UserService $service) {}

    public function index(): JsonResponse
    {
        $users = $this->service->list();

        return $this->success('Users retrieved successfully.', UserResource::collection($users)->response()->getData(true));
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->service->show($id);

        return $this->success('User retrieved successfully.', new UserResource($user));
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->service->create($request->validated());

        return $this->success('User created successfully.', new UserResource($user), 201);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->service->update($id, $request->validated());

        return $this->success('User updated successfully.', new UserResource($user));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return $this->success('User deleted successfully.');
    }

    public function toggleActive(int $id): JsonResponse
    {
        $user = $this->service->toggleActive($id);

        $status = $user->is_active ? 'activated' : 'deactivated';

        return $this->success("User {$status} successfully.", new UserResource($user));
    }
}
<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService
{
    public function __construct(
        private UserRepositoryInterface $users
    ) {}

    public function list(int $perPage = 15): LengthAwarePaginator
    {
        return $this->users->paginate($perPage);
    }

    public function show(int $id): User
    {
        $user = $this->users->findById($id);

        if (!$user) {
            throw new \Exception('User not found.', 404);
        }

        return $user;
    }

    public function create(array $data): User
    {
        $user = $this->users->create([
            'username'  => $data['username'],
            'firstname' => $data['firstname'],
            'lastname'  => $data['lastname'],
            'email'     => $data['email'],
            'password'  => bcrypt($data['password']),
            'is_active' => true,
        ]);

        $user->assignRole($data['role']);

        return $user->load('roles');
    }

    public function update(int $id, array $data): User
    {
        $user = $this->show($id);

        $payload = array_filter([
            'username'  => $data['username'] ?? null,
            'firstname' => $data['firstname'] ?? null,
            'lastname'  => $data['lastname'] ?? null,
            'email'     => $data['email'] ?? null,
            'password'  => isset($data['password']) ? bcrypt($data['password']) : null,
        ]);

        $user = $this->users->update($user, $payload);

        if (!empty($data['role'])) {
            $user->syncRoles($data['role']);
        }

        return $user;
    }

    public function delete(int $id): void
    {
        $user = $this->show($id);

        $this->users->delete($user);
    }

    public function toggleActive(int $id): User
    {
        $user = $this->show($id);

        $this->users->update($user, [
            'is_active' => !$user->is_active,
        ]);

        return $user->fresh('roles');
    }
}

<?php

namespace App\Services;

use App\Http\Resources\UserResource;
use App\Models\RefreshToken;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthService
{
    private const ACCESS_TOKEN_EXPIRY_MINUTES = 15;
    private const REFRESH_TOKEN_EXPIRY_DAYS   = 30;

    public function __construct(
        private UserRepositoryInterface $users
    ) {}

    public function register(array $data): array
    {
        $user = $this->users->create([
            'username'  => $data['username'],
            'firstname' => $data['firstname'],
            'lastname'  => $data['lastname'],
            'email'     => $data['email'],
            'password'  => bcrypt($data['password']),
            'is_active' => true,
        ]);

        $user->assignRole($data['role'] ?? 'warehouse_employee');

        return $this->issueTokens($user);
    }

    public function login(string $email, string $password): array
    {
        $user = $this->users->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            throw new AuthenticationException('Invalid credentials.');
        }

        if (!$user->is_active) {
            throw new AuthenticationException('Account is deactivated.');
        }

        return $this->issueTokens($user);
    }

    public function refresh(string $refreshToken): array
    {
        $token = RefreshToken::where('token', $refreshToken)->first();

        if (!$token || $token->isExpired()) {
            throw new AuthenticationException('Invalid or expired refresh token.');
        }

        $user = $token->user;

        $token->delete();

        return $this->issueTokens($user);
    }

    public function logout($user): void
    {
        $user->tokens()->delete();
        $user->refreshTokens()->delete();
    }

    private function issueTokens($user): array
    {
        $user->tokens()->delete();

        $accessToken = $user->createToken(
            'api',
            ['*'],
            now()->addMinutes(self::ACCESS_TOKEN_EXPIRY_MINUTES)
        )->plainTextToken;

        $refreshToken = RefreshToken::create([
            'user_id'    => $user->id,
            'token'      => Str::random(64),
            'expires_at' => now()->addDays(self::REFRESH_TOKEN_EXPIRY_DAYS),
        ]);

        return [
            'user'          => new UserResource($user->load('roles')),
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken->token,
            'expires_in'    => self::ACCESS_TOKEN_EXPIRY_MINUTES * 60,
        ];
    }
}

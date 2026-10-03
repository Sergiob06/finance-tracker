<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

it('revokes the current token on logout', function () {
    $user = User::factory()->create(['password' => 'Secret123!']);

    $token = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'Secret123!',
    ])->json('token');

    $this->withHeader('Authorization', "Bearer {$token}")
        ->postJson('/api/logout')
        ->assertOk();

    expect(PersonalAccessToken::count())->toBe(0);

    // The sanctum guard memoizes the resolved user for the lifetime of the
    // container; forget it so the next call re-resolves against the (now
    // deleted) token instead of reusing the cached pre-logout user. Real
    // requests never hit this because each one gets a fresh container.
    Auth::forgetGuards();

    $this->withHeader('Authorization', "Bearer {$token}")
        ->getJson('/api/user')
        ->assertUnauthorized();
});

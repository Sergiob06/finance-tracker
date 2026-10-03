<?php

use App\Models\User;

it('logs in with correct credentials and returns a token', function () {
    $user = User::factory()->create(['password' => 'Secret123!']);

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'Secret123!',
    ])->assertOk()->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
});

it('rejects an incorrect password', function () {
    $user = User::factory()->create(['password' => 'Secret123!']);

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');
});

it('rejects an unknown email', function () {
    $this->postJson('/api/login', [
        'email' => 'nobody@example.com',
        'password' => 'whatever123',
    ])->assertUnprocessable();
});

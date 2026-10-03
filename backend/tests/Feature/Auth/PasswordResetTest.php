<?php

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

it('sends a password reset link for an existing user', function () {
    Notification::fake();
    $user = User::factory()->create();

    $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();

    Notification::assertSentTo($user, ResetPasswordNotification::class);
});

it('resets the password with a valid token and allows logging in with the new password', function () {
    $user = User::factory()->create(['password' => 'OldPassword1!']);
    $token = Password::createToken($user);

    $this->postJson('/api/reset-password', [
        'token' => $token,
        'email' => $user->email,
        'password' => 'NewPassword1!',
        'password_confirmation' => 'NewPassword1!',
    ])->assertOk();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'NewPassword1!',
    ])->assertOk();
});

it('rejects resetting the password with an invalid token', function () {
    $user = User::factory()->create();

    $this->postJson('/api/reset-password', [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'NewPassword1!',
        'password_confirmation' => 'NewPassword1!',
    ])->assertUnprocessable();
});

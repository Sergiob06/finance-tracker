<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;

it('registers a new user and returns a token', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'Ana Test',
        'email' => 'ana@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

    expect(User::where('email', 'ana@example.com')->exists())->toBeTrue();
});

it('sends an email verification notification on register', function () {
    Notification::fake();

    $this->postJson('/api/register', [
        'name' => 'Ana Test',
        'email' => 'ana@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertCreated();

    Notification::assertSentTo(User::where('email', 'ana@example.com')->first(), VerifyEmail::class);
});

it('rejects registration with a duplicate email', function () {
    User::factory()->create(['email' => 'dup@example.com']);

    $this->postJson('/api/register', [
        'name' => 'Otro',
        'email' => 'dup@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertUnprocessable()->assertJsonValidationErrors('email');
});

it('requires the password confirmation to match', function () {
    $this->postJson('/api/register', [
        'name' => 'Ana Test',
        'email' => 'ana2@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Otra123!',
    ])->assertUnprocessable()->assertJsonValidationErrors('password');
});

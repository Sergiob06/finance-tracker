<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\Sanctum;

it('verifies the email with a valid signed link and redirects to the frontend', function () {
    $user = User::factory()->unverified()->create();

    $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
        'id' => $user->id,
        'hash' => sha1($user->getEmailForVerification()),
    ]);

    $this->get($url)->assertRedirect(rtrim(config('app.frontend_url'), '/').'/email-verified?status=success');

    expect($user->refresh()->hasVerifiedEmail())->toBeTrue();
});

it('does not verify the email when the hash is invalid', function () {
    $user = User::factory()->unverified()->create();

    $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
        'id' => $user->id,
        'hash' => 'not-the-right-hash',
    ]);

    $this->get($url)->assertRedirect(rtrim(config('app.frontend_url'), '/').'/email-verified?status=invalid');

    expect($user->refresh()->hasVerifiedEmail())->toBeFalse();
});

it('resends the verification notification for an authenticated unverified user', function () {
    Notification::fake();
    $user = User::factory()->unverified()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/email/verification-notification')->assertOk();

    Notification::assertSentTo($user, VerifyEmail::class);
});

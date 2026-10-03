<?php

use App\Models\Account;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('lists only the authenticated user\'s accounts', function () {
    Account::factory()->count(2)->create(['user_id' => $this->user->id]);
    Account::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->getJson('/api/accounts')->assertOk()->assertJsonCount(2, 'data');
});

it('creates an account', function () {
    $this->postJson('/api/accounts', [
        'name' => 'Cuenta Corriente',
        'type' => 'bank',
        'balance' => 500,
        'color' => '#3B82F6',
        'icon' => 'landmark',
    ])->assertCreated()->assertJsonPath('data.balance', 500);

    expect(Account::where('user_id', $this->user->id)->count())->toBe(1);
});

it('rejects an invalid account type', function () {
    $this->postJson('/api/accounts', ['name' => 'X', 'type' => 'crypto'])
        ->assertUnprocessable()->assertJsonValidationErrors('type');
});

it('updates an account without touching its balance', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id, 'balance' => 250]);

    $this->putJson("/api/accounts/{$account->id}", ['name' => 'Nueva Cuenta', 'type' => $account->type])
        ->assertOk()->assertJsonPath('data.name', 'Nueva Cuenta');

    expect($account->refresh()->balance)->toEqual('250.00');
});

it('deletes an account', function () {
    $account = Account::factory()->create(['user_id' => $this->user->id]);

    $this->deleteJson("/api/accounts/{$account->id}")->assertNoContent();

    expect(Account::find($account->id))->toBeNull();
});

it('prevents a user from viewing another user\'s account', function () {
    $account = Account::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->getJson("/api/accounts/{$account->id}")->assertForbidden();
});

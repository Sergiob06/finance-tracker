<?php

use App\Models\SavingsGoal;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('creates a savings goal', function () {
    $this->postJson('/api/savings-goals', [
        'name' => 'Vacaciones',
        'target_amount' => 1500,
        'target_date' => '2026-12-31',
    ])->assertCreated()->assertJsonPath('data.name', 'Vacaciones');
});

it('contributes an amount and updates the progress', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id, 'target_amount' => 1000, 'current_amount' => 200,
    ]);

    $this->postJson("/api/savings-goals/{$goal->id}/contribute", ['amount' => 300])
        ->assertOk()
        ->assertJsonPath('data.current_amount', 500)
        ->assertJsonPath('data.percentage', 50)
        ->assertJsonPath('data.completed', false);
});

it('marks a goal as completed once the target is reached', function () {
    $goal = SavingsGoal::factory()->create([
        'user_id' => $this->user->id, 'target_amount' => 500, 'current_amount' => 400,
    ]);

    $this->postJson("/api/savings-goals/{$goal->id}/contribute", ['amount' => 200])
        ->assertOk()
        ->assertJsonPath('data.completed', true)
        ->assertJsonPath('data.percentage', 100);
});

it('prevents a user from contributing to another user\'s goal', function () {
    $goal = SavingsGoal::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->postJson("/api/savings-goals/{$goal->id}/contribute", ['amount' => 100])->assertForbidden();
});

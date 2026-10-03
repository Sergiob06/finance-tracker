<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

afterEach(fn () => Carbon::setTestNow());

it('creates a budget for an expense category', function () {
    $category = Category::factory()->expense()->create(['user_id' => $this->user->id]);

    $this->postJson('/api/budgets', [
        'category_id' => $category->id,
        'amount' => 300,
        'month' => '2026-01',
    ])->assertCreated()->assertJsonPath('data.month', '2026-01-01');
});

it('rejects a budget for an income category', function () {
    $income = Category::factory()->income()->create(['user_id' => $this->user->id]);

    $this->postJson('/api/budgets', [
        'category_id' => $income->id,
        'amount' => 300,
        'month' => '2026-01',
    ])->assertUnprocessable()->assertJsonValidationErrors('category_id');
});

it('rejects a duplicate budget for the same category and month', function () {
    $category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    Budget::factory()->create(['user_id' => $this->user->id, 'category_id' => $category->id, 'month' => '2026-01-01']);

    $this->postJson('/api/budgets', [
        'category_id' => $category->id,
        'amount' => 300,
        'month' => '2026-01-15',
    ])->assertUnprocessable()->assertJsonValidationErrors('month');
});

it('calculates spent amount, percentage and exceeded from matching expense transactions', function () {
    Carbon::setTestNow('2026-03-15');

    $category = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $account = Account::factory()->create(['user_id' => $this->user->id]);
    $budget = Budget::factory()->create([
        'user_id' => $this->user->id,
        'category_id' => $category->id,
        'amount' => 100,
        'month' => Carbon::now()->startOfMonth(),
    ]);

    Transaction::factory()->create([
        'user_id' => $this->user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'expense', 'amount' => 60, 'date' => Carbon::now(),
    ]);
    Transaction::factory()->create([
        'user_id' => $this->user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'expense', 'amount' => 60, 'date' => Carbon::now(),
    ]);
    // Outside the budget's month — must not count.
    Transaction::factory()->create([
        'user_id' => $this->user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'expense', 'amount' => 999, 'date' => Carbon::now()->subMonths(2),
    ]);

    $this->getJson("/api/budgets/{$budget->id}")->assertOk()
        ->assertJsonPath('data.spent', 120)
        ->assertJsonPath('data.percentage', 120)
        ->assertJsonPath('data.exceeded', true);
});

it('prevents a user from deleting another user\'s budget', function () {
    $budget = Budget::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->deleteJson("/api/budgets/{$budget->id}")->assertForbidden();
});

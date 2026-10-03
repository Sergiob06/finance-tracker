<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Laravel\Sanctum\Sanctum;

afterEach(fn () => Carbon::setTestNow());

it('creates a recurring transaction', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->expense()->create(['user_id' => $user->id]);

    $this->postJson('/api/recurring-transactions', [
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 15.99,
        'description' => 'Netflix',
        'frequency' => 'monthly',
        'next_run_date' => '2026-09-01',
    ])->assertCreated()->assertJsonPath('data.frequency', 'monthly');
});

it('rejects a category whose type does not match the recurring transaction type', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = Account::factory()->create(['user_id' => $user->id]);
    $income = Category::factory()->income()->create(['user_id' => $user->id]);

    $this->postJson('/api/recurring-transactions', [
        'account_id' => $account->id,
        'category_id' => $income->id,
        'type' => 'expense',
        'amount' => 10,
        'frequency' => 'monthly',
        'next_run_date' => '2026-09-01',
    ])->assertUnprocessable()->assertJsonValidationErrors('category_id');
});

it('generates due transactions, catching up several periods, and advances the next run date', function () {
    Carbon::setTestNow('2026-03-15');

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id, 'balance' => 0]);
    $category = Category::factory()->expense()->create(['user_id' => $user->id]);

    $recurring = RecurringTransaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 50,
        'frequency' => 'monthly',
        'next_run_date' => '2026-01-15',
        'active' => true,
    ]);

    Artisan::call('recurring:generate');

    expect(Transaction::where('user_id', $user->id)->count())->toBe(3);
    expect($recurring->refresh()->next_run_date->toDateString())->toBe('2026-04-15');
    expect($account->refresh()->balance)->toEqual('-150.00');
});

it('does not generate transactions for inactive recurring transactions', function () {
    Carbon::setTestNow('2026-03-15');

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->expense()->create(['user_id' => $user->id]);

    RecurringTransaction::factory()->inactive()->create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'next_run_date' => '2026-01-15',
    ]);

    Artisan::call('recurring:generate');

    expect(Transaction::where('user_id', $user->id)->count())->toBe(0);
});

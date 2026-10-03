<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BudgetCalculator;
use Illuminate\Support\Carbon;

afterEach(fn () => Carbon::setTestNow());

it('sums only expense transactions within the budget\'s month and category', function () {
    Carbon::setTestNow('2026-05-10');

    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->expense()->create(['user_id' => $user->id]);
    $otherCategory = Category::factory()->expense()->create(['user_id' => $user->id]);

    $budget = Budget::factory()->create([
        'user_id' => $user->id, 'category_id' => $category->id, 'amount' => 100, 'month' => '2026-05-01',
    ]);

    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'expense', 'amount' => 60, 'date' => '2026-05-05',
    ]);
    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'expense', 'amount' => 60, 'date' => '2026-05-20',
    ]);
    // Different category — must not count.
    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $otherCategory->id,
        'type' => 'expense', 'amount' => 999, 'date' => '2026-05-05',
    ]);
    // Same category, income instead of expense — must not count.
    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'income', 'amount' => 999, 'date' => '2026-05-05',
    ]);
    // Same category, different month — must not count.
    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'expense', 'amount' => 999, 'date' => '2026-04-05',
    ]);

    $calculator = app(BudgetCalculator::class);

    expect($calculator->spent($budget))->toEqual(120.0);
    expect($calculator->percentage($budget))->toEqual(120.0);
});

it('returns a zero percentage when the budget amount is zero', function () {
    $budget = Budget::factory()->create(['amount' => 0]);
    $calculator = app(BudgetCalculator::class);

    expect($calculator->percentage($budget, 50.0))->toEqual(0.0);
});

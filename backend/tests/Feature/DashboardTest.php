<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\Sanctum;

afterEach(fn () => Carbon::setTestNow());

it('returns balance totals, monthly comparison and category breakdown', function () {
    Carbon::setTestNow('2026-03-15');

    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $account = Account::factory()->create(['user_id' => $user->id, 'balance' => 500]);
    $expenseCategory = Category::factory()->expense()->create(['user_id' => $user->id]);
    $incomeCategory = Category::factory()->income()->create(['user_id' => $user->id]);

    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $incomeCategory->id,
        'type' => 'income', 'amount' => 1000, 'date' => '2026-03-05',
    ]);
    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $expenseCategory->id,
        'type' => 'expense', 'amount' => 200, 'date' => '2026-03-10',
    ]);
    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $expenseCategory->id,
        'type' => 'expense', 'amount' => 100, 'date' => '2026-02-10',
    ]);

    $response = $this->getJson('/api/dashboard')->assertOk();

    $response->assertJsonPath('data.balance_total', 500)
        ->assertJsonPath('data.current_month.income', 1000)
        ->assertJsonPath('data.current_month.expense', 200)
        ->assertJsonPath('data.previous_month.expense', 100)
        ->assertJsonPath('data.expenses_by_category.0.total', 200)
        ->assertJsonPath('data.expenses_by_category.0.category_id', $expenseCategory->id);

    expect($response->json('data.monthly_evolution'))->toHaveCount(6);
    expect($response->json('data.monthly_evolution.5.month'))->toBe('2026-03');
});

it('reports a null income change percentage when there was no income the previous month', function () {
    Carbon::setTestNow('2026-03-15');

    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->income()->create(['user_id' => $user->id]);

    Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id,
        'type' => 'income', 'amount' => 500, 'date' => '2026-03-05',
    ]);

    $this->getJson('/api/dashboard')->assertOk()
        ->assertJsonPath('data.comparison.income_change_percent', null);
});

<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->account = Account::factory()->create(['user_id' => $this->user->id, 'balance' => 1000]);
    $this->savings = Account::factory()->create(['user_id' => $this->user->id, 'balance' => 0]);
    $this->expenseCategory = Category::factory()->expense()->create(['user_id' => $this->user->id]);
    $this->incomeCategory = Category::factory()->income()->create(['user_id' => $this->user->id]);
    Sanctum::actingAs($this->user);
});

it('creates an income transaction and increases the account balance', function () {
    $this->postJson('/api/transactions', [
        'type' => 'income',
        'account_id' => $this->account->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 200,
        'date' => '2026-01-01',
    ])->assertCreated();

    expect($this->account->refresh()->balance)->toEqual('1200.00');
});

it('creates an expense transaction and decreases the account balance', function () {
    $this->postJson('/api/transactions', [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 200,
        'date' => '2026-01-01',
    ])->assertCreated();

    expect($this->account->refresh()->balance)->toEqual('800.00');
});

it('creates a transfer and updates both account balances', function () {
    $this->postJson('/api/transactions', [
        'type' => 'transfer',
        'account_id' => $this->account->id,
        'transfer_to_account_id' => $this->savings->id,
        'amount' => 300,
        'date' => '2026-01-01',
    ])->assertCreated();

    expect($this->account->refresh()->balance)->toEqual('700.00');
    expect($this->savings->refresh()->balance)->toEqual('300.00');
});

it('reverses and reapplies the balance effect when a transaction is updated', function () {
    $id = $this->postJson('/api/transactions', [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 100,
        'date' => '2026-01-01',
    ])->json('data.id');

    expect($this->account->refresh()->balance)->toEqual('900.00');

    $this->putJson("/api/transactions/{$id}", [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 150,
        'date' => '2026-01-01',
    ])->assertOk();

    expect($this->account->refresh()->balance)->toEqual('850.00');
});

it('reverses the balance effect when a transaction is deleted', function () {
    $id = $this->postJson('/api/transactions', [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 100,
        'date' => '2026-01-01',
    ])->json('data.id');

    expect($this->account->refresh()->balance)->toEqual('900.00');

    $this->deleteJson("/api/transactions/{$id}")->assertNoContent();

    expect($this->account->refresh()->balance)->toEqual('1000.00');
});

it('rejects a category whose type does not match the transaction type', function () {
    $this->postJson('/api/transactions', [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->incomeCategory->id,
        'amount' => 50,
        'date' => '2026-01-01',
    ])->assertUnprocessable()->assertJsonValidationErrors('category_id');
});

it('requires a transfer_to_account_id for transfers and rejects transferring to the same account', function () {
    $this->postJson('/api/transactions', [
        'type' => 'transfer',
        'account_id' => $this->account->id,
        'amount' => 50,
        'date' => '2026-01-01',
    ])->assertUnprocessable()->assertJsonValidationErrors('transfer_to_account_id');

    $this->postJson('/api/transactions', [
        'type' => 'transfer',
        'account_id' => $this->account->id,
        'transfer_to_account_id' => $this->account->id,
        'amount' => 50,
        'date' => '2026-01-01',
    ])->assertUnprocessable()->assertJsonValidationErrors('transfer_to_account_id');
});

it('filters transactions by type, date range and search text', function () {
    Transaction::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->expenseCategory->id,
        'type' => 'expense',
        'date' => '2026-01-15',
    ]);

    Transaction::factory()->create([
        'user_id' => $this->user->id,
        'account_id' => $this->account->id,
        'category_id' => $this->incomeCategory->id,
        'type' => 'income',
        'description' => 'Bono especial',
        'date' => '2026-02-01',
    ]);

    $this->getJson('/api/transactions?type=income')->assertOk()->assertJsonCount(1, 'data');
    $this->getJson('/api/transactions?search=Bono')->assertOk()->assertJsonCount(1, 'data');
    $this->getJson('/api/transactions?date_from=2026-02-01')->assertOk()->assertJsonCount(1, 'data');
    $this->getJson('/api/transactions?date_to=2026-01-31')->assertOk()->assertJsonCount(3, 'data');
});

it('prevents a user from accessing another user\'s transaction', function () {
    $other = User::factory()->create();
    $otherAccount = Account::factory()->create(['user_id' => $other->id]);
    $otherTransaction = Transaction::factory()->create(['user_id' => $other->id, 'account_id' => $otherAccount->id]);

    $this->getJson("/api/transactions/{$otherTransaction->id}")->assertForbidden();
});

it('stores an uploaded receipt image with the transaction', function () {
    Storage::fake('public');

    $response = $this->post('/api/transactions', [
        'type' => 'expense',
        'account_id' => $this->account->id,
        'category_id' => $this->expenseCategory->id,
        'amount' => 20,
        'date' => '2026-01-01',
        'receipt' => UploadedFile::fake()->create('receipt.jpg', 100, 'image/jpeg'),
    ], ['Accept' => 'application/json'])->assertCreated();

    $transaction = Transaction::find($response->json('data.id'));

    expect($transaction->receipt_path)->not->toBeNull();
    Storage::disk('public')->assertExists($transaction->receipt_path);
    expect($response->json('data.receipt_url'))->not->toBeNull();
});

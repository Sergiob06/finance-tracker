<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use App\Services\TransactionBalanceService;

it('applies and reverses income and expense effects on the account balance', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id, 'balance' => 100]);
    $service = app(TransactionBalanceService::class);

    $income = Transaction::factory()->create([
        'user_id' => $user->id, 'account_id' => $account->id, 'type' => 'income', 'amount' => 40,
    ]);

    $service->apply($income);
    expect($account->refresh()->balance)->toEqual('140.00');

    $service->reverse($income);
    expect($account->refresh()->balance)->toEqual('100.00');
});

it('applies and reverses a transfer across both accounts', function () {
    $user = User::factory()->create();
    $source = Account::factory()->create(['user_id' => $user->id, 'balance' => 100]);
    $destination = Account::factory()->create(['user_id' => $user->id, 'balance' => 50]);
    $service = app(TransactionBalanceService::class);

    $transfer = Transaction::factory()->create([
        'user_id' => $user->id,
        'account_id' => $source->id,
        'transfer_to_account_id' => $destination->id,
        'category_id' => null,
        'type' => 'transfer',
        'amount' => 30,
    ]);

    $service->apply($transfer);
    expect($source->refresh()->balance)->toEqual('70.00');
    expect($destination->refresh()->balance)->toEqual('80.00');

    $service->reverse($transfer);
    expect($source->refresh()->balance)->toEqual('100.00');
    expect($destination->refresh()->balance)->toEqual('50.00');
});

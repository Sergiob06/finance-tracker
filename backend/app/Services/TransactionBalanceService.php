<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;

/**
 * Keeps account balances in sync with the transactions that affect them.
 *
 * Every transaction's effect on a balance is reversible: applying it adds the
 * signed amount to the relevant account(s), reversing it subtracts the same
 * amount. Updating or deleting a transaction always reverses the old effect
 * before applying the new one, so balances never drift from transaction history.
 */
class TransactionBalanceService
{
    public function apply(Transaction $transaction): void
    {
        $this->adjust($transaction, 1);
    }

    public function reverse(Transaction $transaction): void
    {
        $this->adjust($transaction, -1);
    }

    private function adjust(Transaction $transaction, int $sign): void
    {
        $amount = $sign * (float) $transaction->amount;

        match ($transaction->type) {
            'income' => Account::whereKey($transaction->account_id)->increment('balance', $amount),
            'expense' => Account::whereKey($transaction->account_id)->decrement('balance', $amount),
            'transfer' => $this->adjustTransfer($transaction, $amount),
            default => throw new \ValueError("Unknown transaction type [{$transaction->type}]."),
        };
    }

    private function adjustTransfer(Transaction $transaction, float $amount): void
    {
        Account::whereKey($transaction->account_id)->decrement('balance', $amount);
        Account::whereKey($transaction->transfer_to_account_id)->increment('balance', $amount);
    }
}

<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;

class BudgetCalculator
{
    public function spent(Budget $budget): float
    {
        return (float) Transaction::where('user_id', $budget->user_id)
            ->where('category_id', $budget->category_id)
            ->where('type', 'expense')
            ->whereBetween('date', [
                $budget->month->copy()->startOfMonth()->toDateString(),
                $budget->month->copy()->endOfMonth()->toDateString(),
            ])
            ->sum('amount');
    }

    public function percentage(Budget $budget, ?float $spent = null): float
    {
        $spent ??= $this->spent($budget);
        $amount = (float) $budget->amount;

        if ($amount <= 0.0) {
            return 0.0;
        }

        return round(($spent / $amount) * 100, 2);
    }
}

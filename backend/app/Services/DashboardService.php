<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DashboardService
{
    public function summary(User $user): array
    {
        $now = Carbon::now();
        $startOfThisMonth = $now->copy()->startOfMonth();
        $endOfThisMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        $balanceTotal = (float) $user->accounts()->sum('balance');

        [$incomeThisMonth, $expenseThisMonth] = $this->totalsBetween($user, $startOfThisMonth, $endOfThisMonth);
        [$incomeLastMonth, $expenseLastMonth] = $this->totalsBetween($user, $startOfLastMonth, $endOfLastMonth);

        $expensesByCategory = $this->expensesByCategory($user, $startOfThisMonth, $endOfThisMonth);

        return [
            'balance_total' => $balanceTotal,
            'current_month' => [
                'income' => $incomeThisMonth,
                'expense' => $expenseThisMonth,
                'net' => round($incomeThisMonth - $expenseThisMonth, 2),
            ],
            'previous_month' => [
                'income' => $incomeLastMonth,
                'expense' => $expenseLastMonth,
                'net' => round($incomeLastMonth - $expenseLastMonth, 2),
            ],
            'comparison' => [
                'income_change_percent' => $this->percentChange($incomeLastMonth, $incomeThisMonth),
                'expense_change_percent' => $this->percentChange($expenseLastMonth, $expenseThisMonth),
            ],
            'expenses_by_category' => $expensesByCategory->values()->all(),
            'top_expense_categories' => $expensesByCategory->take(5)->values()->all(),
            'monthly_evolution' => $this->monthlyEvolution($user, 6),
        ];
    }

    /**
     * @return array{0: float, 1: float}
     */
    private function totalsBetween(User $user, Carbon $start, Carbon $end): array
    {
        $income = (float) $user->transactions()
            ->where('type', 'income')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount');

        $expense = (float) $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->sum('amount');

        return [$income, $expense];
    }

    private function expensesByCategory(User $user, Carbon $start, Carbon $end): Collection
    {
        return $user->transactions()
            ->select('category_id')
            ->selectRaw('SUM(amount) as total')
            ->where('type', 'expense')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->groupBy('category_id')
            ->with('category:id,name,color,icon')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'category_id' => $row->category_id,
                'name' => $row->category?->name ?? 'Sin categoría',
                'color' => $row->category?->color,
                'icon' => $row->category?->icon,
                'total' => (float) $row->total,
            ]);
    }

    private function monthlyEvolution(User $user, int $months): array
    {
        $start = Carbon::now()->subMonths($months - 1)->startOfMonth();

        $transactions = $user->transactions()
            ->whereIn('type', ['income', 'expense'])
            ->where('date', '>=', $start->toDateString())
            ->get(['type', 'amount', 'date']);

        $buckets = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $key = Carbon::now()->subMonths($i)->format('Y-m');
            $buckets[$key] = ['month' => $key, 'income' => 0.0, 'expense' => 0.0];
        }

        foreach ($transactions as $transaction) {
            $key = $transaction->date->format('Y-m');

            if (isset($buckets[$key])) {
                $buckets[$key][$transaction->type] += (float) $transaction->amount;
            }
        }

        return array_values($buckets);
    }

    private function percentChange(float $previous, float $current): ?float
    {
        if ($previous === 0.0) {
            return $current === 0.0 ? 0.0 : null;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }
}

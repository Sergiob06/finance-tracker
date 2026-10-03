<?php

namespace App\Console\Commands;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Services\TransactionBalanceService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

#[Signature('recurring:generate')]
#[Description('Generate due transactions from active recurring transactions and advance their next run date')]
class GenerateRecurringTransactions extends Command
{
    public function handle(TransactionBalanceService $balances): int
    {
        $today = Carbon::today();
        $generated = 0;

        RecurringTransaction::where('active', true)
            ->where('next_run_date', '<=', $today->toDateString())
            ->each(function (RecurringTransaction $recurring) use ($balances, $today, &$generated) {
                DB::transaction(function () use ($recurring, $balances, $today, &$generated) {
                    while ($recurring->next_run_date->lte($today)) {
                        $transaction = Transaction::create([
                            'user_id' => $recurring->user_id,
                            'account_id' => $recurring->account_id,
                            'category_id' => $recurring->category_id,
                            'type' => $recurring->type,
                            'amount' => $recurring->amount,
                            'description' => $recurring->description,
                            'date' => $recurring->next_run_date,
                        ]);

                        $balances->apply($transaction);
                        $generated++;

                        $recurring->next_run_date = $this->nextRunDate($recurring->next_run_date, $recurring->frequency);
                    }

                    $recurring->save();
                });
            });

        $this->info("Generated {$generated} transaction(s) from recurring schedules.");

        return self::SUCCESS;
    }

    private function nextRunDate(Carbon $date, string $frequency): Carbon
    {
        return match ($frequency) {
            'daily' => $date->copy()->addDay(),
            'weekly' => $date->copy()->addWeek(),
            'monthly' => $date->copy()->addMonthNoOverflow(),
            'yearly' => $date->copy()->addYearNoOverflow(),
        };
    }
}

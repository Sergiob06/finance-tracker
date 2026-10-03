<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class DemoDataSeeder extends Seeder
{
    private const CATEGORY_COLORS = [
        'Alimentación' => '#22C55E',
        'Transporte' => '#3B82F6',
        'Vivienda' => '#8B5CF6',
        'Ocio' => '#EC4899',
        'Salud' => '#EF4444',
        'Educación' => '#0EA5E9',
        'Ropa' => '#F97316',
        'Suscripciones' => '#A855F7',
        'Restaurantes' => '#F43F5E',
        'Viajes' => '#14B8A6',
        'Otros gastos' => '#64748B',
        'Salario' => '#10B981',
        'Freelance' => '#6366F1',
        'Inversiones' => '#F59E0B',
        'Regalos' => '#EC4899',
        'Otros ingresos' => '#64748B',
    ];

    private const EXPENSE_WEIGHTS = [
        'Alimentación' => 5,
        'Transporte' => 4,
        'Restaurantes' => 4,
        'Ocio' => 3,
        'Ropa' => 2,
        'Salud' => 2,
        'Suscripciones' => 1,
        'Educación' => 1,
        'Viajes' => 1,
        'Otros gastos' => 2,
    ];

    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Demo User',
            'email' => 'demo@financetracker.test',
        ]);

        [$checking, $savings, $cash, $card] = $this->createAccounts($user);
        $categories = $this->createCategories($user);
        $expenseCategories = $categories->where('type', 'expense');
        $incomeCategories = $categories->where('type', 'income');

        $this->createTransactions($user, $checking, $savings, $cash, $card, $expenseCategories, $incomeCategories);
        $this->recalculateBalances([$checking, $savings, $cash, $card]);

        $this->createBudgets($user, $expenseCategories);
        $this->createRecurringTransactions($user, $checking, $categories);
        $this->createSavingsGoals($user);
    }

    /**
     * @return array<int, Account>
     */
    private function createAccounts(User $user): array
    {
        $checking = Account::factory()->bank()->create([
            'user_id' => $user->id,
            'name' => 'Cuenta Corriente',
            'balance' => 0,
        ]);

        $savings = Account::factory()->bank()->create([
            'user_id' => $user->id,
            'name' => 'Cuenta de Ahorros',
            'balance' => 0,
        ]);

        $cash = Account::factory()->cash()->create([
            'user_id' => $user->id,
            'balance' => 0,
        ]);

        $card = Account::factory()->card()->create([
            'user_id' => $user->id,
            'name' => 'Tarjeta de Crédito',
            'balance' => 0,
        ]);

        return [$checking, $savings, $cash, $card];
    }

    private function createCategories(User $user): Collection
    {
        $categories = collect();

        foreach (CategoryFactory::EXPENSE_CATEGORIES as $name => $icon) {
            $categories->push(Category::create([
                'user_id' => $user->id,
                'name' => $name,
                'type' => 'expense',
                'color' => self::CATEGORY_COLORS[$name],
                'icon' => $icon,
            ]));
        }

        foreach (CategoryFactory::INCOME_CATEGORIES as $name => $icon) {
            $categories->push(Category::create([
                'user_id' => $user->id,
                'name' => $name,
                'type' => 'income',
                'color' => self::CATEGORY_COLORS[$name],
                'icon' => $icon,
            ]));
        }

        return $categories;
    }

    private function createTransactions(
        User $user,
        Account $checking,
        Account $savings,
        Account $cash,
        Account $card,
        Collection $expenseCategories,
        Collection $incomeCategories,
    ): void {
        $salary = $incomeCategories->firstWhere('name', 'Salario');
        $freelance = $incomeCategories->firstWhere('name', 'Freelance');
        $vivienda = $expenseCategories->firstWhere('name', 'Vivienda');
        $suscripciones = $expenseCategories->firstWhere('name', 'Suscripciones');

        $spendingAccounts = [$checking, $cash, $card];

        for ($monthsAgo = 5; $monthsAgo >= 0; $monthsAgo--) {
            $monthStart = Carbon::now()->subMonths($monthsAgo)->startOfMonth();

            Transaction::factory()->create([
                'user_id' => $user->id,
                'account_id' => $checking->id,
                'category_id' => $salary->id,
                'type' => 'income',
                'amount' => fake()->randomFloat(2, 2200, 2600),
                'description' => 'Nómina mensual',
                'date' => $monthStart->copy()->addDays(fake()->numberBetween(0, 2)),
                'transfer_to_account_id' => null,
            ]);

            Transaction::factory()->create([
                'user_id' => $user->id,
                'account_id' => $checking->id,
                'category_id' => $vivienda->id,
                'type' => 'expense',
                'amount' => fake()->randomFloat(2, 650, 900),
                'description' => 'Alquiler',
                'date' => $monthStart->copy()->addDays(fake()->numberBetween(1, 5)),
                'transfer_to_account_id' => null,
            ]);

            Transaction::factory()->create([
                'user_id' => $user->id,
                'account_id' => $card->id,
                'category_id' => $suscripciones->id,
                'type' => 'expense',
                'amount' => fake()->randomFloat(2, 25, 45),
                'description' => 'Suscripciones streaming',
                'date' => $monthStart->copy()->addDays(fake()->numberBetween(1, 10)),
                'transfer_to_account_id' => null,
            ]);

            if (fake()->boolean(40)) {
                Transaction::factory()->create([
                    'user_id' => $user->id,
                    'account_id' => $checking->id,
                    'category_id' => $freelance->id,
                    'type' => 'income',
                    'amount' => fake()->randomFloat(2, 150, 900),
                    'description' => 'Proyecto freelance',
                    'date' => $monthStart->copy()->addDays(fake()->numberBetween(5, 25)),
                    'transfer_to_account_id' => null,
                ]);
            }

            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $checking->id,
                'category_id' => null,
                'type' => 'transfer',
                'amount' => fake()->randomFloat(2, 100, 400),
                'description' => 'Ahorro mensual',
                'date' => $monthStart->copy()->addDays(fake()->numberBetween(2, 6)),
                'transfer_to_account_id' => $savings->id,
            ]);

            $expensesThisMonth = fake()->numberBetween(12, 20);
            $spentByAccount = [$cash->id => 0.0, $card->id => (float) 35];

            for ($i = 0; $i < $expensesThisMonth; $i++) {
                $category = $this->weightedExpenseCategory($expenseCategories);
                $account = fake()->randomElement($spendingAccounts);
                $amount = fake()->randomFloat(2, 4, 120);

                Transaction::factory()->create([
                    'user_id' => $user->id,
                    'account_id' => $account->id,
                    'category_id' => $category->id,
                    'type' => 'expense',
                    'amount' => $amount,
                    'description' => fake()->randomElement([
                        'Supermercado', 'Gasolina', 'Cena fuera', 'Cine', 'Farmacia',
                        'Transporte público', 'Compra online', 'Café', 'Parking', 'Regalo',
                    ]),
                    'date' => $monthStart->copy()->addDays(fake()->numberBetween(0, $monthStart->daysInMonth - 1)),
                    'transfer_to_account_id' => null,
                ]);

                if (isset($spentByAccount[$account->id])) {
                    $spentByAccount[$account->id] += $amount;
                }
            }

            // Replenish cash and pay off the card based on what was actually spent
            // that month, so both accounts settle near zero instead of drifting.
            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $checking->id,
                'category_id' => null,
                'type' => 'transfer',
                'amount' => round($spentByAccount[$cash->id] + fake()->randomFloat(2, 20, 60), 2),
                'description' => 'Retirada cajero',
                'date' => $monthStart->copy()->addDays(fake()->numberBetween(3, 8)),
                'transfer_to_account_id' => $cash->id,
            ]);

            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $checking->id,
                'category_id' => null,
                'type' => 'transfer',
                'amount' => round($spentByAccount[$card->id], 2),
                'description' => 'Pago tarjeta de crédito',
                'date' => $monthStart->copy()->addDays(fake()->numberBetween(20, 27)),
                'transfer_to_account_id' => $card->id,
            ]);
        }
    }

    private function weightedExpenseCategory(Collection $expenseCategories): Category
    {
        $pool = [];

        foreach ($expenseCategories as $category) {
            $weight = self::EXPENSE_WEIGHTS[$category->name] ?? 1;
            for ($i = 0; $i < $weight; $i++) {
                $pool[] = $category;
            }
        }

        return fake()->randomElement($pool);
    }

    /**
     * @param  array<int, Account>  $accounts
     */
    private function recalculateBalances(array $accounts): void
    {
        foreach ($accounts as $account) {
            $income = Transaction::where('account_id', $account->id)
                ->where('type', 'income')->sum('amount');
            $expense = Transaction::where('account_id', $account->id)
                ->where('type', 'expense')->sum('amount');
            $transferOut = Transaction::where('account_id', $account->id)
                ->where('type', 'transfer')->sum('amount');
            $transferIn = Transaction::where('transfer_to_account_id', $account->id)
                ->where('type', 'transfer')->sum('amount');

            $account->update([
                'balance' => $income - $expense - $transferOut + $transferIn,
            ]);
        }
    }

    private function createBudgets(User $user, Collection $expenseCategories): void
    {
        $budgeted = ['Alimentación' => 400, 'Transporte' => 150, 'Ocio' => 120, 'Restaurantes' => 180, 'Ropa' => 100, 'Salud' => 80];

        foreach ($budgeted as $name => $amount) {
            $category = $expenseCategories->firstWhere('name', $name);

            Budget::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'amount' => $amount,
                'month' => Carbon::now()->startOfMonth(),
            ]);
        }
    }

    private function createRecurringTransactions(User $user, Account $checking, Collection $categories): void
    {
        $salary = $categories->firstWhere('name', 'Salario');
        $vivienda = $categories->firstWhere('name', 'Vivienda');
        $suscripciones = $categories->firstWhere('name', 'Suscripciones');

        RecurringTransaction::create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'category_id' => $salary->id,
            'type' => 'income',
            'amount' => 2400,
            'description' => 'Nómina mensual',
            'frequency' => 'monthly',
            'next_run_date' => Carbon::now()->addMonth()->startOfMonth(),
            'active' => true,
        ]);

        RecurringTransaction::create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'category_id' => $vivienda->id,
            'type' => 'expense',
            'amount' => 750,
            'description' => 'Alquiler',
            'frequency' => 'monthly',
            'next_run_date' => Carbon::now()->addMonth()->startOfMonth()->addDays(4),
            'active' => true,
        ]);

        RecurringTransaction::create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'category_id' => $suscripciones->id,
            'type' => 'expense',
            'amount' => 15.99,
            'description' => 'Netflix',
            'frequency' => 'monthly',
            'next_run_date' => Carbon::now()->addDays(fake()->numberBetween(1, 20)),
            'active' => true,
        ]);
    }

    private function createSavingsGoals(User $user): void
    {
        SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Fondo de emergencia',
            'target_amount' => 6000,
            'current_amount' => 2100,
            'target_date' => Carbon::now()->addMonths(10),
            'icon' => 'shield',
            'color' => '#10B981',
        ]);

        SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Vacaciones',
            'target_amount' => 1500,
            'current_amount' => 620,
            'target_date' => Carbon::now()->addMonths(4),
            'icon' => 'plane',
            'color' => '#F59E0B',
        ]);

        SavingsGoal::create([
            'user_id' => $user->id,
            'name' => 'Coche nuevo',
            'target_amount' => 12000,
            'current_amount' => 1800,
            'target_date' => Carbon::now()->addMonths(18),
            'icon' => 'car',
            'color' => '#6366F1',
        ]);
    }
}

<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RecurringTransaction>
 */
class RecurringTransactionFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);

        return [
            'user_id' => User::factory(),
            'account_id' => Account::factory(),
            'category_id' => Category::factory()->state(['type' => $type]),
            'type' => $type,
            'amount' => $type === 'income'
                ? fake()->randomFloat(2, 500, 3000)
                : fake()->randomFloat(2, 5, 200),
            'description' => fake()->sentence(3),
            'frequency' => fake()->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
            'next_run_date' => fake()->dateTimeBetween('now', '+1 month'),
            'active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn () => ['active' => false]);
    }
}

<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
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
                ? fake()->randomFloat(2, 200, 3000)
                : fake()->randomFloat(2, 3, 400),
            'description' => fake()->sentence(3),
            'date' => fake()->dateTimeBetween('-6 months', 'now'),
            'receipt_path' => null,
            'transfer_to_account_id' => null,
        ];
    }

    public function income(): static
    {
        return $this->state(fn () => [
            'type' => 'income',
            'amount' => fake()->randomFloat(2, 200, 3000),
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn () => [
            'type' => 'expense',
            'amount' => fake()->randomFloat(2, 3, 400),
        ]);
    }

    public function transfer(): static
    {
        return $this->state(fn () => [
            'type' => 'transfer',
            'category_id' => null,
            'amount' => fake()->randomFloat(2, 20, 1000),
            'transfer_to_account_id' => Account::factory(),
        ]);
    }
}

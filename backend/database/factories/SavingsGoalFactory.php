<?php

namespace Database\Factories;

use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingsGoal>
 */
class SavingsGoalFactory extends Factory
{
    private const GOALS = [
        'Fondo de emergencia' => 'shield',
        'Vacaciones' => 'plane',
        'Coche nuevo' => 'car',
        'Entrada casa' => 'home',
        'Boda' => 'heart',
    ];

    public function definition(): array
    {
        $name = fake()->randomElement(array_keys(self::GOALS));
        $target = fake()->randomFloat(2, 1000, 20000);

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'target_amount' => $target,
            'current_amount' => fake()->randomFloat(2, 0, $target),
            'target_date' => fake()->dateTimeBetween('+3 months', '+2 years'),
            'icon' => self::GOALS[$name],
            'color' => fake()->hexColor(),
        ];
    }
}

<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Account>
 */
class AccountFactory extends Factory
{
    private const NAMES_BY_TYPE = [
        'bank' => ['Cuenta Corriente', 'Cuenta de Ahorros', 'Cuenta Nómina'],
        'cash' => ['Efectivo'],
        'card' => ['Tarjeta de Crédito', 'Tarjeta de Débito'],
    ];

    private const ICONS_BY_TYPE = [
        'bank' => 'landmark',
        'cash' => 'wallet',
        'card' => 'credit-card',
    ];

    public function definition(): array
    {
        $type = fake()->randomElement(['bank', 'cash', 'card']);

        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(self::NAMES_BY_TYPE[$type]),
            'type' => $type,
            'balance' => fake()->randomFloat(2, -500, 8000),
            'color' => fake()->hexColor(),
            'icon' => self::ICONS_BY_TYPE[$type],
        ];
    }

    public function bank(): static
    {
        return $this->state(fn () => [
            'type' => 'bank',
            'name' => fake()->randomElement(self::NAMES_BY_TYPE['bank']),
            'icon' => self::ICONS_BY_TYPE['bank'],
        ]);
    }

    public function cash(): static
    {
        return $this->state(fn () => [
            'type' => 'cash',
            'name' => 'Efectivo',
            'icon' => self::ICONS_BY_TYPE['cash'],
        ]);
    }

    public function card(): static
    {
        return $this->state(fn () => [
            'type' => 'card',
            'name' => fake()->randomElement(self::NAMES_BY_TYPE['card']),
            'icon' => self::ICONS_BY_TYPE['card'],
        ]);
    }
}

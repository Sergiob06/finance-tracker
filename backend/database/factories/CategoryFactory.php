<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public const EXPENSE_CATEGORIES = [
        'Alimentación' => 'shopping-cart',
        'Transporte' => 'car',
        'Vivienda' => 'home',
        'Ocio' => 'gamepad-2',
        'Salud' => 'heart-pulse',
        'Educación' => 'graduation-cap',
        'Ropa' => 'shirt',
        'Suscripciones' => 'repeat',
        'Restaurantes' => 'utensils',
        'Viajes' => 'plane',
        'Otros gastos' => 'more-horizontal',
    ];

    public const INCOME_CATEGORIES = [
        'Salario' => 'briefcase',
        'Freelance' => 'laptop',
        'Inversiones' => 'trending-up',
        'Regalos' => 'gift',
        'Otros ingresos' => 'more-horizontal',
    ];

    public function definition(): array
    {
        $type = fake()->randomElement(['income', 'expense']);
        $pool = $type === 'income' ? self::INCOME_CATEGORIES : self::EXPENSE_CATEGORIES;
        $name = fake()->randomElement(array_keys($pool));

        return [
            'user_id' => User::factory(),
            'name' => $name,
            'type' => $type,
            'color' => fake()->hexColor(),
            'icon' => $pool[$name],
        ];
    }

    public function income(): static
    {
        return $this->state(function () {
            $name = fake()->randomElement(array_keys(self::INCOME_CATEGORIES));

            return [
                'type' => 'income',
                'name' => $name,
                'icon' => self::INCOME_CATEGORIES[$name],
            ];
        });
    }

    public function expense(): static
    {
        return $this->state(function () {
            $name = fake()->randomElement(array_keys(self::EXPENSE_CATEGORIES));

            return [
                'type' => 'expense',
                'name' => $name,
                'icon' => self::EXPENSE_CATEGORIES[$name],
            ];
        });
    }
}

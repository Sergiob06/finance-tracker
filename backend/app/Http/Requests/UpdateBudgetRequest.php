<?php

namespace App\Http\Requests;

use App\Models\Budget;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('month')) {
            $this->merge(['month' => Carbon::parse($this->input('month'))->startOfMonth()->toDateString()]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'category_id' => [
                'sometimes', 'required', 'integer',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'month' => ['sometimes', 'required', 'date'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            /** @var Budget $budget */
            $budget = $this->route('budget');
            $categoryId = $this->input('category_id', $budget->category_id);

            if ($this->filled('category_id')) {
                $category = Category::find($this->input('category_id'));

                if ($category && $category->type !== 'expense') {
                    $validator->errors()->add('category_id', 'Los presupuestos solo pueden asignarse a categorías de gasto.');
                }
            }

            if (! $this->filled('category_id') && ! $this->filled('month')) {
                return;
            }

            $month = $this->input('month', $budget->month->toDateString());

            if (Budget::where('user_id', $this->user()->id)
                ->where('category_id', $categoryId)
                ->whereDate('month', $month)
                ->whereKeyNot($budget->id)
                ->exists()) {
                $validator->errors()->add('month', 'Ya existe un presupuesto para esta categoría en este mes.');
            }
        });
    }
}

<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()->id;

        return [
            'account_id' => [
                'sometimes', 'required', 'integer',
                Rule::exists('accounts', 'id')->where('user_id', $userId),
            ],
            'category_id' => [
                'nullable', 'integer',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'type' => ['sometimes', 'required', Rule::in(['income', 'expense'])],
            'amount' => ['sometimes', 'required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'description' => ['nullable', 'string', 'max:255'],
            'frequency' => ['sometimes', 'required', Rule::in(['daily', 'weekly', 'monthly', 'yearly'])],
            'next_run_date' => ['sometimes', 'required', 'date'],
            'active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if (! $this->filled('category_id')) {
                return;
            }

            $type = $this->input('type', $this->route('recurring_transaction')?->type);
            $category = Category::find($this->input('category_id'));

            if ($category && $type && $category->type !== $type) {
                $validator->errors()->add(
                    'category_id',
                    'La categoría seleccionada no coincide con el tipo de transacción.'
                );
            }
        });
    }
}

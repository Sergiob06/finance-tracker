<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTransactionRequest extends FormRequest
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
            'type' => ['required', Rule::in(['income', 'expense', 'transfer'])],
            'account_id' => [
                'required', 'integer',
                Rule::exists('accounts', 'id')->where('user_id', $userId),
            ],
            'category_id' => [
                'nullable', 'integer', 'required_unless:type,transfer',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'transfer_to_account_id' => [
                'nullable', 'integer', 'required_if:type,transfer', 'different:account_id',
                Rule::exists('accounts', 'id')->where('user_id', $userId),
            ],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999.99'],
            'description' => ['nullable', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'receipt' => ['nullable', 'image', 'max:5120'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('type') === 'transfer' || ! $this->filled('category_id')) {
                return;
            }

            $category = Category::find($this->input('category_id'));

            if ($category && $category->type !== $this->input('type')) {
                $validator->errors()->add(
                    'category_id',
                    'La categoría seleccionada no coincide con el tipo de transacción.'
                );
            }
        });
    }
}

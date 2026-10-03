<?php

namespace App\Http\Resources;

use App\Models\RecurringTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin RecurringTransaction
 */
class RecurringTransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'account' => new AccountResource($this->whenLoaded('account')),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'type' => $this->type,
            'amount' => (float) $this->amount,
            'description' => $this->description,
            'frequency' => $this->frequency,
            'next_run_date' => $this->next_run_date->toDateString(),
            'active' => (bool) $this->active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

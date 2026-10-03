<?php

namespace App\Http\Resources;

use App\Services\BudgetCalculator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BudgetResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $calculator = app(BudgetCalculator::class);
        $spent = $calculator->spent($this->resource);
        $amount = (float) $this->amount;

        return [
            'id' => $this->id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'amount' => $amount,
            'month' => $this->month->toDateString(),
            'spent' => $spent,
            'remaining' => round($amount - $spent, 2),
            'percentage' => $calculator->percentage($this->resource, $spent),
            'exceeded' => $spent > $amount,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

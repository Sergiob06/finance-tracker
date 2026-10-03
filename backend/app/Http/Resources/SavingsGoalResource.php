<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SavingsGoalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $target = (float) $this->target_amount;
        $current = (float) $this->current_amount;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'target_amount' => $target,
            'current_amount' => $current,
            'remaining' => max(0, round($target - $current, 2)),
            'percentage' => $target > 0 ? round(min($current / $target, 1) * 100, 2) : 0.0,
            'completed' => $current >= $target,
            'target_date' => $this->target_date?->toDateString(),
            'icon' => $this->icon,
            'color' => $this->color,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

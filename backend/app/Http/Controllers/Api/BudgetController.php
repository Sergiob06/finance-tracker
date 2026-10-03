<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Http\Resources\BudgetResource;
use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class BudgetController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Budget::class);

        $month = $request->filled('month')
            ? Carbon::parse($request->query('month'))->startOfMonth()
            : Carbon::now()->startOfMonth();

        $budgets = $request->user()->budgets()
            ->with('category')
            ->whereDate('month', $month->toDateString())
            ->get();

        return BudgetResource::collection($budgets);
    }

    public function store(StoreBudgetRequest $request): BudgetResource
    {
        $this->authorize('create', Budget::class);

        $budget = $request->user()->budgets()->create($request->validated());

        return new BudgetResource($budget->load('category'));
    }

    public function show(Budget $budget): BudgetResource
    {
        $this->authorize('view', $budget);

        return new BudgetResource($budget->load('category'));
    }

    public function update(UpdateBudgetRequest $request, Budget $budget): BudgetResource
    {
        $this->authorize('update', $budget);

        $budget->update($request->validated());

        return new BudgetResource($budget->load('category'));
    }

    public function destroy(Budget $budget): Response
    {
        $this->authorize('delete', $budget);

        $budget->delete();

        return response()->noContent();
    }
}

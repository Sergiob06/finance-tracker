<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContributeSavingsGoalRequest;
use App\Http\Requests\StoreSavingsGoalRequest;
use App\Http\Requests\UpdateSavingsGoalRequest;
use App\Http\Resources\SavingsGoalResource;
use App\Models\SavingsGoal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SavingsGoalController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', SavingsGoal::class);

        $savingsGoals = $request->user()->savingsGoals()->orderBy('target_date')->get();

        return SavingsGoalResource::collection($savingsGoals);
    }

    public function store(StoreSavingsGoalRequest $request): SavingsGoalResource
    {
        $this->authorize('create', SavingsGoal::class);

        $savingsGoal = $request->user()->savingsGoals()->create($request->validated());

        return new SavingsGoalResource($savingsGoal);
    }

    public function show(SavingsGoal $savingsGoal): SavingsGoalResource
    {
        $this->authorize('view', $savingsGoal);

        return new SavingsGoalResource($savingsGoal);
    }

    public function update(UpdateSavingsGoalRequest $request, SavingsGoal $savingsGoal): SavingsGoalResource
    {
        $this->authorize('update', $savingsGoal);

        $savingsGoal->update($request->validated());

        return new SavingsGoalResource($savingsGoal);
    }

    public function destroy(SavingsGoal $savingsGoal): Response
    {
        $this->authorize('delete', $savingsGoal);

        $savingsGoal->delete();

        return response()->noContent();
    }

    public function contribute(ContributeSavingsGoalRequest $request, SavingsGoal $savingsGoal): SavingsGoalResource
    {
        $this->authorize('update', $savingsGoal);

        $savingsGoal->increment('current_amount', $request->validated('amount'));

        return new SavingsGoalResource($savingsGoal);
    }
}

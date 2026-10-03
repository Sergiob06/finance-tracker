<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRecurringTransactionRequest;
use App\Http\Requests\UpdateRecurringTransactionRequest;
use App\Http\Resources\RecurringTransactionResource;
use App\Models\RecurringTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class RecurringTransactionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', RecurringTransaction::class);

        $recurringTransactions = $request->user()->recurringTransactions()
            ->with(['account', 'category'])
            ->orderBy('next_run_date')
            ->get();

        return RecurringTransactionResource::collection($recurringTransactions);
    }

    public function store(StoreRecurringTransactionRequest $request): RecurringTransactionResource
    {
        $this->authorize('create', RecurringTransaction::class);

        $recurringTransaction = $request->user()->recurringTransactions()->create($request->validated());

        return new RecurringTransactionResource($recurringTransaction->load(['account', 'category']));
    }

    public function show(RecurringTransaction $recurringTransaction): RecurringTransactionResource
    {
        $this->authorize('view', $recurringTransaction);

        return new RecurringTransactionResource($recurringTransaction->load(['account', 'category']));
    }

    public function update(UpdateRecurringTransactionRequest $request, RecurringTransaction $recurringTransaction): RecurringTransactionResource
    {
        $this->authorize('update', $recurringTransaction);

        $recurringTransaction->update($request->validated());

        return new RecurringTransactionResource($recurringTransaction->load(['account', 'category']));
    }

    public function destroy(RecurringTransaction $recurringTransaction): Response
    {
        $this->authorize('delete', $recurringTransaction);

        $recurringTransaction->delete();

        return response()->noContent();
    }
}

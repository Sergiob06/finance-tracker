<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\TransactionBalanceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TransactionController extends Controller
{
    public function __construct(private readonly TransactionBalanceService $balances) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Transaction::class);

        $perPage = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ])['per_page'] ?? 15;

        $transactions = $this->filteredQuery($request)
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->paginate($perPage);

        return TransactionResource::collection($transactions);
    }

    public function store(StoreTransactionRequest $request): TransactionResource
    {
        $this->authorize('create', Transaction::class);

        $transaction = DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['receipt_path'] = $this->storeReceipt($request);

            $transaction = $request->user()->transactions()->create($data);

            $this->balances->apply($transaction);

            return $transaction;
        });

        return new TransactionResource($transaction->load(['account', 'category', 'transferToAccount']));
    }

    public function show(Transaction $transaction): TransactionResource
    {
        $this->authorize('view', $transaction);

        return new TransactionResource($transaction->load(['account', 'category', 'transferToAccount']));
    }

    public function update(UpdateTransactionRequest $request, Transaction $transaction): TransactionResource
    {
        $this->authorize('update', $transaction);

        DB::transaction(function () use ($request, $transaction) {
            $this->balances->reverse($transaction);

            $data = $request->validated();

            if ($newReceiptPath = $this->storeReceipt($request)) {
                $this->deleteReceipt($transaction);
                $data['receipt_path'] = $newReceiptPath;
            }

            $transaction->update($data);

            $this->balances->apply($transaction);
        });

        return new TransactionResource($transaction->load(['account', 'category', 'transferToAccount']));
    }

    public function destroy(Transaction $transaction): Response
    {
        $this->authorize('delete', $transaction);

        DB::transaction(function () use ($transaction) {
            $this->balances->reverse($transaction);
            $this->deleteReceipt($transaction);
            $transaction->delete();
        });

        return response()->noContent();
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->authorize('viewAny', Transaction::class);

        $transactions = $this->filteredQuery($request)->orderBy('date')->get();

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Fecha', 'Tipo', 'Cuenta', 'Categoría', 'Descripción', 'Importe']);

            foreach ($transactions as $transaction) {
                fputcsv($handle, [
                    $transaction->date->toDateString(),
                    $transaction->type,
                    $transaction->account->name,
                    $transaction->category?->name ?? '',
                    $transaction->description,
                    number_format((float) $transaction->amount, 2, '.', ''),
                ]);
            }

            fclose($handle);
        }, 'transacciones.csv', ['Content-Type' => 'text/csv']);
    }

    public function exportPdf(Request $request): Response
    {
        $this->authorize('viewAny', Transaction::class);

        $transactions = $this->filteredQuery($request)->orderBy('date')->get();

        $pdf = Pdf::loadView('exports.transactions-pdf', [
            'transactions' => $transactions,
            'user' => $request->user(),
            'generatedAt' => now(),
        ]);

        return $pdf->download('transacciones.pdf');
    }

    private function filteredQuery(Request $request): HasMany
    {
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'account_id' => ['nullable', 'integer'],
            'category_id' => ['nullable', 'integer'],
            'type' => ['nullable', Rule::in(['income', 'expense', 'transfer'])],
            'search' => ['nullable', 'string', 'max:255'],
        ]);

        return $request->user()->transactions()
            ->with(['account', 'category', 'transferToAccount'])
            ->when($filters['date_from'] ?? null, fn ($q, $v) => $q->whereDate('date', '>=', $v))
            ->when($filters['date_to'] ?? null, fn ($q, $v) => $q->whereDate('date', '<=', $v))
            ->when($filters['account_id'] ?? null, fn ($q, $v) => $q->where('account_id', $v))
            ->when($filters['category_id'] ?? null, fn ($q, $v) => $q->where('category_id', $v))
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->where('type', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('description', 'like', '%'.$v.'%'));
    }

    private function storeReceipt(Request $request): ?string
    {
        if (! $request->hasFile('receipt')) {
            return null;
        }

        return $request->file('receipt')->store('receipts', 'public');
    }

    private function deleteReceipt(Transaction $transaction): void
    {
        if ($transaction->receipt_path) {
            Storage::disk('public')->delete($transaction->receipt_path);
        }
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transacciones</title>
    <style>
        body { font-family: 'Helvetica', sans-serif; font-size: 11px; color: #1F2937; }
        h1 { font-size: 16px; margin-bottom: 2px; }
        .subtitle { color: #6B7280; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #E5E7EB; }
        th { background-color: #F3F4F6; text-transform: uppercase; font-size: 9px; letter-spacing: 0.03em; color: #6B7280; }
        .amount { text-align: right; white-space: nowrap; }
        .income { color: #16A34A; }
        .expense { color: #DC2626; }
        .transfer { color: #2563EB; }
        .totals { margin-top: 16px; font-size: 12px; }
        .totals td { border: none; padding: 2px 8px; }
    </style>
</head>
<body>
    <h1>Finance Tracker &middot; Transacciones</h1>
    <p class="subtitle">
        {{ $user->name }} &middot; generado el {{ $generatedAt->format('d/m/Y H:i') }} &middot; {{ $transactions->count() }} movimientos
    </p>

    <table>
        <thead>
            <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cuenta</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th class="amount">Importe</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($transactions as $transaction)
                <tr>
                    <td>{{ $transaction->date->format('d/m/Y') }}</td>
                    <td class="{{ $transaction->type }}">
                        {{ ['income' => 'Ingreso', 'expense' => 'Gasto', 'transfer' => 'Transferencia'][$transaction->type] }}
                    </td>
                    <td>{{ $transaction->account->name }}</td>
                    <td>{{ $transaction->category?->name ?? '—' }}</td>
                    <td>{{ $transaction->description ?? '—' }}</td>
                    <td class="amount {{ $transaction->type }}">{{ number_format($transaction->amount, 2, ',', '.') }} €</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td>Ingresos:</td>
            <td class="amount income">{{ number_format($transactions->where('type', 'income')->sum('amount'), 2, ',', '.') }} €</td>
        </tr>
        <tr>
            <td>Gastos:</td>
            <td class="amount expense">{{ number_format($transactions->where('type', 'expense')->sum('amount'), 2, ',', '.') }} €</td>
        </tr>
    </table>
</body>
</html>

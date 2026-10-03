<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);

    $account = Account::factory()->create(['user_id' => $this->user->id]);
    $category = Category::factory()->expense()->create(['user_id' => $this->user->id]);

    Transaction::factory()->create([
        'user_id' => $this->user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 42.5,
        'description' => 'Cena de prueba',
        'date' => '2026-01-10',
    ]);
});

it('exports filtered transactions as csv', function () {
    $response = $this->get('/api/transactions/export/csv');

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');
    expect($response->streamedContent())
        ->toContain('Fecha,Tipo,Cuenta,Categoría,Descripción,Importe')
        ->toContain('Cena de prueba');
});

it('exports filtered transactions as pdf', function () {
    $response = $this->get('/api/transactions/export/pdf');

    $response->assertOk();
    expect($response->headers->get('content-type'))->toBe('application/pdf');
});

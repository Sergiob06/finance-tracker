<?php

use App\Models\Category;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    $this->user = User::factory()->create();
    Sanctum::actingAs($this->user);
});

it('lists only the authenticated user\'s categories', function () {
    Category::factory()->count(3)->create(['user_id' => $this->user->id]);
    Category::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->getJson('/api/categories')->assertOk()->assertJsonCount(3, 'data');
});

it('creates a category', function () {
    $this->postJson('/api/categories', [
        'name' => 'Alimentación',
        'type' => 'expense',
        'color' => '#22C55E',
        'icon' => 'shopping-cart',
    ])->assertCreated()->assertJsonPath('data.name', 'Alimentación');
});

it('rejects an invalid category type', function () {
    $this->postJson('/api/categories', ['name' => 'X', 'type' => 'savings'])
        ->assertUnprocessable()->assertJsonValidationErrors('type');
});

it('updates a category', function () {
    $category = Category::factory()->expense()->create(['user_id' => $this->user->id]);

    $this->putJson("/api/categories/{$category->id}", ['name' => 'Nuevo nombre'])
        ->assertOk()->assertJsonPath('data.name', 'Nuevo nombre');
});

it('deletes a category', function () {
    $category = Category::factory()->create(['user_id' => $this->user->id]);

    $this->deleteJson("/api/categories/{$category->id}")->assertNoContent();

    expect(Category::find($category->id))->toBeNull();
});

it('prevents a user from updating another user\'s category', function () {
    $category = Category::factory()->create(['user_id' => User::factory()->create()->id]);

    $this->putJson("/api/categories/{$category->id}", ['name' => 'Hackeo'])->assertForbidden();
});

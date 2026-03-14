<?php

use Illuminate\Support\Facades\Route;

Route::prefix('wms')->group(function () {
    Route::get('/health', function () {
        return ['status' => 'healthy'];
    });
});

require __DIR__ . '/auth.php';

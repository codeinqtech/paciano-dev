<?php

use App\Http\Controllers\GoogleReviewAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('google/callback', [GoogleReviewAuthController::class, 'callback'])
    ->name('google.callback');

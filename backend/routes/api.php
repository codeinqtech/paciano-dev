<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password/otp/send', [AuthController::class, 'sendForgotPasswordOtp']);
    Route::post('forgot-password/otp/verify', [AuthController::class, 'verifyForgotPasswordOtp']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::post('change-password/otp/send', [AuthController::class, 'sendChangePasswordOtp']);
        Route::post('change-password/otp/verify', [AuthController::class, 'verifyChangePasswordOtp']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::prefix('admin')->group(function (): void {
        Route::get('users', [AdminUserController::class, 'index']);
        Route::post('users', [AdminUserController::class, 'store']);
        Route::put('users/{id}', [AdminUserController::class, 'update']);
        Route::delete('users/{id}', [AdminUserController::class, 'destroy']);
    });
});

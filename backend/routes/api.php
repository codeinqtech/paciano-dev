<?php

use App\Http\Controllers\Api\AdminUserController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HomeAdminController;
use App\Http\Controllers\Api\HomePublicController;
use App\Http\Controllers\Api\HomeSectionsAdminController;
use App\Http\Controllers\Api\HomeSectionsPublicController;
use App\Http\Controllers\Api\SiteFooterController;
use App\Http\Controllers\Api\SiteNavigationMenuController;
use Illuminate\Support\Facades\Route;

Route::get('navigation-menus', [SiteNavigationMenuController::class, 'publicIndex']);
Route::get('site-footer', [SiteFooterController::class, 'publicIndex']);

Route::prefix('home')->group(function (): void {
    Route::get('banner-slides', [HomePublicController::class, 'bannerSlides']);
    Route::get('location', [HomePublicController::class, 'location']);
    Route::get('review-videos', [HomePublicController::class, 'reviewVideos']);

    Route::get('sections/about', [HomeSectionsPublicController::class, 'about']);
    Route::get('sections/experiences', [HomeSectionsPublicController::class, 'experiences']);
    Route::get('sections/stays', [HomeSectionsPublicController::class, 'stays']);
    Route::get('sections/dining', [HomeSectionsPublicController::class, 'dining']);
});

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

        Route::get('navigation-menus', [SiteNavigationMenuController::class, 'index']);
        Route::post('navigation-menus', [SiteNavigationMenuController::class, 'store']);
        Route::put('navigation-menus/{id}', [SiteNavigationMenuController::class, 'update']);
        Route::delete('navigation-menus/{id}', [SiteNavigationMenuController::class, 'destroy']);

        Route::get('site-footer', [SiteFooterController::class, 'adminIndex']);
        Route::put('site-footer/settings', [SiteFooterController::class, 'updateSettings']);
        Route::post('site-footer/social', [SiteFooterController::class, 'storeSocial']);
        Route::put('site-footer/social/{id}', [SiteFooterController::class, 'updateSocial']);
        Route::delete('site-footer/social/{id}', [SiteFooterController::class, 'destroySocial']);
        Route::post('site-footer/location-info', [SiteFooterController::class, 'storeLocationInfo']);
        Route::put('site-footer/location-info/{id}', [SiteFooterController::class, 'updateLocationInfo']);
        Route::delete('site-footer/location-info/{id}', [SiteFooterController::class, 'destroyLocationInfo']);

        Route::get('home/banner-slides', [HomeAdminController::class, 'bannerIndex']);
        Route::post('home/banner-slides', [HomeAdminController::class, 'bannerStore']);
        Route::put('home/banner-slides/{id}', [HomeAdminController::class, 'bannerUpdate']);
        Route::delete('home/banner-slides/{id}', [HomeAdminController::class, 'bannerDestroy']);

        Route::get('home/location', [HomeAdminController::class, 'locationShow']);
        Route::post('home/location', [HomeAdminController::class, 'locationUpdate']);

        Route::get('home/review-videos', [HomeAdminController::class, 'reviewIndex']);
        Route::post('home/review-videos', [HomeAdminController::class, 'reviewStore']);
        Route::post('home/review-videos/{id}', [HomeAdminController::class, 'reviewUpdate']);
        Route::delete('home/review-videos/{id}', [HomeAdminController::class, 'reviewDestroy']);

        Route::get('home/sections/about', [HomeSectionsAdminController::class, 'aboutShow']);
        Route::post('home/sections/about', [HomeSectionsAdminController::class, 'aboutUpdate']);

        Route::get('home/sections/experiences', [HomeSectionsAdminController::class, 'experiencesShow']);
        Route::post('home/sections/experiences/intro', [HomeSectionsAdminController::class, 'experiencesSectionUpdate']);
        Route::post('home/sections/experiences/items/{id}', [HomeSectionsAdminController::class, 'experienceItemUpdate']);

        Route::get('home/sections/stays', [HomeSectionsAdminController::class, 'staysShow']);
        Route::post('home/sections/stays/intro', [HomeSectionsAdminController::class, 'staysSectionUpdate']);
        Route::post('home/sections/stays/items/{id}', [HomeSectionsAdminController::class, 'stayItemUpdate']);

        Route::get('home/sections/dining', [HomeSectionsAdminController::class, 'diningShow']);
        Route::post('home/sections/dining/intro', [HomeSectionsAdminController::class, 'diningSectionUpdate']);
        Route::post('home/sections/dining/slides/{id}', [HomeSectionsAdminController::class, 'diningSlideUpdate']);
    });
});

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| AUTH PUBLIC
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {

    Route::post('/register', [AuthController::class, 'register']);

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1'); // 🔥 anti brute force

    Route::post('/verify-login-otp', [AuthController::class, 'verifyLoginOtp'])
        ->middleware('throttle:5,1');

    Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
});


/*
|--------------------------------------------------------------------------
| AUTH PROTECTED
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('user')->group(function () {
        Route::get('/', [AuthController::class, 'me']);
        Route::put('/', [AuthController::class, 'update']);
        Route::delete('/', [AuthController::class, 'destroy']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});
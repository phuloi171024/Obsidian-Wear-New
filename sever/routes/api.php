<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AddressController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES — Không cần đăng nhập
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Sản phẩm (có filter, search, pagination)
Route::get('/products',      [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Danh mục
Route::get('/categories',      [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Thương hiệu
Route::get('/brands',      [BrandController::class, 'index']);
Route::get('/brands/{id}', [BrandController::class, 'show']);

/*
|--------------------------------------------------------------------------
| PROTECTED ROUTES — Yêu cầu đăng nhập (Bearer Token)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',            [AuthController::class, 'logout']);
    Route::get('/profile',            [AuthController::class, 'profile']);
    Route::put('/profile',            [AuthController::class, 'updateProfile']);
    Route::put('/profile/password',   [AuthController::class, 'changePassword']);

    // Giỏ hàng
    Route::get('/cart',              [CartController::class, 'index']);
    Route::post('/cart',             [CartController::class, 'store']);
    Route::put('/cart/{id}',         [CartController::class, 'update']);
    Route::delete('/cart',           [CartController::class, 'clear']);
    Route::delete('/cart/{id}',      [CartController::class, 'destroy']);

    // Đơn hàng
    Route::get('/orders',               [OrderController::class, 'index']);
    Route::post('/orders',              [OrderController::class, 'store']);
    Route::get('/orders/{id}',          [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel',   [OrderController::class, 'cancel']);

    // Địa chỉ giao hàng
    Route::get('/addresses',                [AddressController::class, 'index']);
    Route::post('/addresses',               [AddressController::class, 'store']);
    Route::put('/addresses/{id}',           [AddressController::class, 'update']);
    Route::delete('/addresses/{id}',        [AddressController::class, 'destroy']);
    Route::put('/addresses/{id}/default',   [AddressController::class, 'setDefault']);
});
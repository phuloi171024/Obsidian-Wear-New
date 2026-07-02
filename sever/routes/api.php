<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AuthController;

// Route lấy danh sách sản phẩm
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
// Những API cần đăng nhập mới dùng được (ví dụ giỏ hàng, đặt hàng)
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
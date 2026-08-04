<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AddressController;

// Admin Controllers
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProductController   as AdminProductController;
use App\Http\Controllers\Admin\CategoryController  as AdminCategoryController;
use App\Http\Controllers\Admin\BrandController     as AdminBrandController;
use App\Http\Controllers\Admin\OrderController     as AdminOrderController;
use App\Http\Controllers\Admin\UserController      as AdminUserController;
use App\Http\Controllers\Admin\CouponController    as AdminCouponController;
use App\Http\Controllers\Admin\ReviewController    as AdminReviewController;
use App\Http\Controllers\Admin\FlashSaleController as AdminFlashSaleController;
use App\Http\Controllers\Admin\PostController      as AdminPostController;

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

/*
|--------------------------------------------------------------------------
| ADMIN ROUTES — Yêu cầu đăng nhập + quyền Admin
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {

    // Dashboard — thống kê tổng hợp
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Quản lý Sản phẩm
    Route::get('/products',                               [AdminProductController::class, 'index']);
    Route::post('/products',                              [AdminProductController::class, 'store']);
    Route::get('/products/{id}',                          [AdminProductController::class, 'show']);
    Route::put('/products/{id}',                          [AdminProductController::class, 'update']);
    Route::delete('/products/{id}',                       [AdminProductController::class, 'destroy']);
    Route::post('/products/{id}/images',                  [AdminProductController::class, 'uploadImages']);
    Route::delete('/products/{id}/images/{imageId}',      [AdminProductController::class, 'deleteImage']);
    Route::post('/products/{id}/variants',                [AdminProductController::class, 'storeVariant']);
    Route::put('/products/{id}/variants/{variantId}',     [AdminProductController::class, 'updateVariant']);
    Route::delete('/products/{id}/variants/{variantId}',  [AdminProductController::class, 'deleteVariant']);

    // Quản lý Danh mục
    Route::get('/categories',       [AdminCategoryController::class, 'index']);
    Route::post('/categories',      [AdminCategoryController::class, 'store']);
    Route::get('/categories/{id}',  [AdminCategoryController::class, 'show']);
    Route::put('/categories/{id}',  [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

    // Quản lý Thương hiệu
    Route::get('/brands',       [AdminBrandController::class, 'index']);
    Route::post('/brands',      [AdminBrandController::class, 'store']);
    Route::get('/brands/{id}',  [AdminBrandController::class, 'show']);
    Route::put('/brands/{id}',  [AdminBrandController::class, 'update']);
    Route::delete('/brands/{id}', [AdminBrandController::class, 'destroy']);

    // Quản lý Đơn hàng
    Route::get('/orders',              [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}',         [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status',  [AdminOrderController::class, 'updateStatus']);

    // Quản lý Người dùng
    Route::get('/users',               [AdminUserController::class, 'index']);
    Route::get('/users/{id}',          [AdminUserController::class, 'show']);
    Route::put('/users/{id}',          [AdminUserController::class, 'update']);
    Route::put('/users/{id}/status',   [AdminUserController::class, 'toggleStatus']);

    // Quản lý Mã giảm giá
    Route::get('/coupons',       [AdminCouponController::class, 'index']);
    Route::post('/coupons',      [AdminCouponController::class, 'store']);
    Route::get('/coupons/{id}',  [AdminCouponController::class, 'show']);
    Route::put('/coupons/{id}',  [AdminCouponController::class, 'update']);
    Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);

    // Quản lý Đánh giá
    Route::get('/reviews',                [AdminReviewController::class, 'index']);
    Route::put('/reviews/{id}/approve',   [AdminReviewController::class, 'approve']);
    Route::put('/reviews/{id}/hide',      [AdminReviewController::class, 'hide']);
    Route::delete('/reviews/{id}',        [AdminReviewController::class, 'destroy']);

    // Quản lý Flash Sale
    Route::get('/flash-sales',                              [AdminFlashSaleController::class, 'index']);
    Route::post('/flash-sales',                             [AdminFlashSaleController::class, 'store']);
    Route::get('/flash-sales/{id}',                         [AdminFlashSaleController::class, 'show']);
    Route::put('/flash-sales/{id}',                         [AdminFlashSaleController::class, 'update']);
    Route::delete('/flash-sales/{id}',                      [AdminFlashSaleController::class, 'destroy']);
    Route::post('/flash-sales/{id}/products',               [AdminFlashSaleController::class, 'addProducts']);
    Route::delete('/flash-sales/{id}/products/{productId}', [AdminFlashSaleController::class, 'removeProduct']);

    // Quản lý Blog / Bài viết
    Route::get('/posts',               [AdminPostController::class, 'index']);
    Route::post('/posts',              [AdminPostController::class, 'store']);
    Route::get('/posts/{id}',          [AdminPostController::class, 'show']);
    Route::put('/posts/{id}',          [AdminPostController::class, 'update']);
    Route::delete('/posts/{id}',       [AdminPostController::class, 'destroy']);
    Route::put('/posts/{id}/publish',  [AdminPostController::class, 'publish']);
    Route::put('/posts/{id}/draft',    [AdminPostController::class, 'draft']);
});
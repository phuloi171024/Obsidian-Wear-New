<?php

use Illuminate\Support\Facades\Route;

// Middleware
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\EnsureUserIsActive;

// Client controllers
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\OrderController as ClientOrderController;
use App\Http\Controllers\Api\ProductController as ClientProductController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VNPayController;
use App\Http\Controllers\Api\WishlistController;

// Admin controllers
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\UserController as AdminUserController;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/

// Trang chủ và sản phẩm
Route::get(
    '/home',
    [ClientProductController::class, 'home']
);

Route::get(
    '/products',
    [ClientProductController::class, 'index']
);

Route::get(
    '/products/{id}',
    [ClientProductController::class, 'show']
);

Route::get(
    '/categories',
    [ClientProductController::class, 'categories']
);

// Xác thực truyền thống
Route::post(
    '/register',
    [AuthController::class, 'register']
)->middleware('throttle:5,1');

Route::post(
    '/login',
    [AuthController::class, 'login']
)->middleware('throttle:5,1');

Route::post(
    '/admin/login',
    [AuthController::class, 'adminLogin']
)->middleware('throttle:5,1');

Route::post(
    '/forgot-password',
    [AuthController::class, 'forgotPassword']
)->middleware('throttle:3,10');

Route::post(
    '/reset-password',
    [AuthController::class, 'resetPassword']
)->middleware('throttle:5,1');

// Google Login
Route::get(
    '/auth/google',
    [AuthController::class, 'redirectToGoogle']
)->middleware('throttle:10,1');

Route::get(
    '/auth/google/callback',
    [AuthController::class, 'handleGoogleCallback']
)->middleware('throttle:20,1');

Route::post(
    '/auth/google/exchange',
    [AuthController::class, 'exchangeGoogleCode']
)->middleware('throttle:10,1');

// Voucher công khai
Route::get(
    '/coupons',
    [CouponController::class, 'index']
);

Route::post(
    '/coupons/apply',
    [CouponController::class, 'apply']
)->middleware('throttle:20,1');

// VNPay Return và IPN
Route::get(
    '/vnpay/return',
    [VNPayController::class, 'vnpayReturn']
);

Route::get(
    '/vnpay/ipn',
    [VNPayController::class, 'vnpayIpn']
);

// Chỉ hiển thị review đã được duyệt
Route::get(
    '/products/{productId}/reviews',
    [ReviewController::class, 'index']
);

/*
|--------------------------------------------------------------------------
| Client protected routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    EnsureUserIsActive::class,
])->group(function () {
    // Đăng xuất và đổi mật khẩu
    Route::post(
        '/logout',
        [AuthController::class, 'logout']
    );

    Route::put(
        '/user/password',
        [UserController::class, 'updatePassword']
    )->middleware('throttle:5,1');

    // Hồ sơ
    Route::get(
        '/user/profile',
        [UserController::class, 'getProfile']
    );

    Route::put(
        '/user/profile',
        [UserController::class, 'updateProfile']
    );

    // Địa chỉ
    Route::get(
        '/user/addresses',
        [AddressController::class, 'index']
    );

    Route::post(
        '/user/addresses',
        [AddressController::class, 'store']
    );

    Route::put(
        '/user/addresses/{id}',
        [AddressController::class, 'update']
    );

    Route::delete(
        '/user/addresses/{id}',
        [AddressController::class, 'destroy']
    );

    // Danh sách yêu thích
    Route::get(
        '/user/wishlist',
        [WishlistController::class, 'index']
    );

    Route::post(
        '/user/wishlist/toggle',
        [WishlistController::class, 'toggle']
    );

    // Giỏ hàng
    Route::get(
        '/cart',
        [CartController::class, 'index']
    );

    Route::post(
        '/cart/add',
        [CartController::class, 'add']
    );

    Route::put(
        '/cart/update/{id}',
        [CartController::class, 'update']
    );

    Route::delete(
        '/cart/remove/{id}',
        [CartController::class, 'remove']
    );

    // Đánh giá
    Route::post(
        '/products/{productId}/reviews',
        [ReviewController::class, 'store']
    )->middleware('throttle:5,10');

    Route::post(
        '/reviews/{id}/report',
        [ReviewController::class, 'report']
    )->middleware('throttle:5,10');

    // Đơn hàng
    Route::get(
        '/orders',
        [ClientOrderController::class, 'index']
    );

    Route::post(
        '/orders',
        [ClientOrderController::class, 'store']
    )->middleware('throttle:10,1');

    Route::get(
        '/orders/{id}',
        [ClientOrderController::class, 'show']
    );

    Route::put(
        '/orders/{id}/cancel',
        [ClientOrderController::class, 'cancel']
    )->middleware('throttle:5,1');

    // VNPay
    Route::post(
        '/vnpay/create',
        [VNPayController::class, 'createPayment']
    )->middleware('throttle:10,1');
});

/*
|--------------------------------------------------------------------------
| Admin protected routes
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    EnsureUserIsActive::class,
    AdminMiddleware::class,
])
    ->prefix('admin')
    ->group(function () {
        // Dashboard
        Route::get(
            '/dashboard',
            [DashboardController::class, 'index']
        );

        // Danh mục
        Route::apiResource(
            '/categories',
            CategoryController::class
        );

        // Thương hiệu
        Route::apiResource(
            '/brands',
            BrandController::class
        );

        // Sản phẩm
        Route::apiResource(
            '/products',
            AdminProductController::class
        );
        // Thêm nhiều ảnh gallery cho sản phẩm
Route::post(
    '/products/{id}/images',
    [AdminProductController::class, 'uploadImages']
);

// Xóa một ảnh gallery
Route::delete(
    '/products/{id}/images/{imageId}',
    [AdminProductController::class, 'deleteImage']
);

        Route::post(
            '/products/{id}/variants',
            [AdminProductController::class, 'addVariant']
        );

        Route::put(
            '/products/{id}/variants/{variantId}',
            [AdminProductController::class, 'updateVariant']
        );

        Route::delete(
            '/products/{id}/variants/{variantId}',
            [AdminProductController::class, 'deleteVariant']
        );

        Route::post(
            '/products/{id}/image',
            [AdminProductController::class, 'updateImage']
        );

        Route::post(
            '/products/{id}/variants/{variantId}/image',
            [AdminProductController::class, 'updateVariantImage']
        );

        // Đơn hàng
        Route::get(
            '/orders',
            [AdminOrderController::class, 'index']
        );

        Route::get(
            '/orders/{id}',
            [AdminOrderController::class, 'show']
        );

        Route::put(
            '/orders/{id}/status',
            [AdminOrderController::class, 'updateStatus']
        );

        // Người dùng
        Route::get(
            '/users',
            [AdminUserController::class, 'index']
        );

        Route::get(
            '/users/{id}',
            [AdminUserController::class, 'show']
        );

        Route::put(
            '/users/{id}',
            [AdminUserController::class, 'update']
        );

        Route::put(
            '/users/{id}/status',
            [AdminUserController::class, 'toggleStatus']
        );

        // Đánh giá
        Route::get(
            '/reviews',
            [AdminReviewController::class, 'index']
        );

        Route::put(
            '/reviews/{id}/approve',
            [AdminReviewController::class, 'approve']
        );

        Route::put(
            '/reviews/{id}/hide',
            [AdminReviewController::class, 'hide']
        );

        Route::delete(
            '/reviews/{id}',
            [AdminReviewController::class, 'destroy']
        );

        // Voucher
        Route::delete(
            '/coupons/bulk',
            [AdminCouponController::class, 'bulkDestroy']
        );

        Route::apiResource(
            '/coupons',
            AdminCouponController::class
        );
    });

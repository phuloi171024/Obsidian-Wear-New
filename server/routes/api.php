<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| IMPORT CONTROLLERS (Phân hệ Controllers)
|--------------------------------------------------------------------------
*/
// 1. Phân hệ Khách hàng (Client API)
use App\Http\Controllers\Api\ProductController as ClientProductController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\OrderController as ClientOrderController; 
use App\Http\Controllers\Api\VNPayController;



// 2. Phân hệ Quản trị viên (Admin API)
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Admin\CouponController as AdminCouponController;

/*
|--------------------------------------------------------------------------
| 1. PUBLIC ROUTES (Không cần đăng nhập)
|--------------------------------------------------------------------------
*/
// Trang chủ & Sản phẩm
Route::get('/home', [ClientProductController::class, 'home']);
Route::get('/products', [ClientProductController::class, 'index']);
Route::get('/products/{id}', [ClientProductController::class, 'show']);



// Xác thực tài khoản & Quên mật khẩu
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Social Login bằng Google
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
// API Áp dụng mã giảm giá
Route::post('/coupons/apply', [CouponController::class, 'apply']);
Route::get('/coupons', [CouponController::class, 'index']);

Route::get('/vnpay/return', [VNPayController::class, 'vnpayReturn']);
/*
|--------------------------------------------------------------------------
| 2. CLIENT PROTECTED ROUTES (Cần đăng nhập - Sanctum Token)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/vnpay/create', [VNPayController::class, 'createPayment']);
    // Route để VNPay gửi IPN ngầm (Server to Server)
Route::get('/vnpay/ipn', [VNPayController::class, 'vnpayIpn']);
    // Đăng xuất
    Route::post('/logout', [AuthController::class, 'logout']);
Route::put('/user/password', [UserController::class, 'updatePassword']);
    // Quản lý thông tin cá nhân
    Route::get('/user/profile', [UserController::class, 'getProfile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);

    // Quản lý sổ địa chỉ giao hàng
    Route::get('/user/addresses', [AddressController::class, 'index']);
    Route::post('/user/addresses', [AddressController::class, 'store']);
    Route::put('/user/addresses/{id}', [AddressController::class, 'update']);
    Route::delete('/user/addresses/{id}', [AddressController::class, 'destroy']);

    // Quản lý danh sách Yêu thích (Wishlist)
    Route::get('/user/wishlist', [WishlistController::class, 'index']);
    Route::post('/user/wishlist/toggle', [WishlistController::class, 'toggle']);

    // Giỏ hàng
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update/{id}', [CartController::class, 'update']);
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove']);

    // 👈 BỔ SUNG: Quản lý đơn hàng của chính khách hàng đang đăng nhập
    Route::get('/orders', [ClientOrderController::class, 'index']);       // Lấy danh sách đơn hàng của user
    Route::post('/orders', [ClientOrderController::class, 'store']);      // Tạo đơn hàng mới từ giỏ hàng
    Route::get('/orders/{id}', [ClientOrderController::class, 'show']);   // Xem chi tiết 1 đơn hàng
    Route::put('/orders/{id}/cancel', [ClientOrderController::class, 'cancel']); // Hủy đơn hàng
});


/*
|--------------------------------------------------------------------------
| 3. ADMIN PROTECTED ROUTES (Khu vực Quản trị Admin)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {

    // 3.1. Dashboard Thống Kê
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // 3.2. Quản Lý Danh Mục (Categories)
    Route::apiResource('/categories', CategoryController::class);

    // 3.3. Quản Lý Thương Hiệu (Brands)
    Route::apiResource('/brands', BrandController::class);

    // 3.4. Quản Lý Sản Phẩm & Biến thể
    Route::apiResource('/products', AdminProductController::class);
    Route::post('/products/{id}/variants', [AdminProductController::class, 'addVariant']);
    Route::put('/products/{id}/variants/{variantId}', [AdminProductController::class, 'updateVariant']);
    Route::delete('/products/{id}/variants/{variantId}', [AdminProductController::class, 'deleteVariant']);

    // 3.5. Quản Lý Đơn Hàng (Orders - Dành cho Admin quản lý toàn hệ thống)
    Route::get('/orders', [AdminOrderController::class, 'index']);
    Route::get('/orders/{id}', [AdminOrderController::class, 'show']);
    Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus']);

    // 3.6. Quản Lý Thành Viên (Users)
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/users/{id}', [AdminUserController::class, 'update']);
    Route::put('/users/{id}/status', [AdminUserController::class, 'toggleStatus']);

    // 3.7. Quản Lý Đánh Giá / Bình Luận (Reviews)
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::put('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
    Route::put('/reviews/{id}/hide', [AdminReviewController::class, 'hide']);
    Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);

    // 3.8. Quản Lý Mã Giảm Giá (Coupons)
    Route::apiResource('/coupons', AdminCouponController::class);
});
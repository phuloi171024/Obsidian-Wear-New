<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Xử lý một request đi vào.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Kiểm tra xem người dùng đã đăng nhập và có role là 'admin' hay không
        if ($request->user() && $request->user()->role === 'admin') {
            return $next($request); // Cho phép đi tiếp vào controller
        }

        // Nếu không phải admin (hoặc chưa đăng nhập), chặn lại và trả về lỗi 403
        return response()->json([
            'status' => false,
            'message' => 'Truy cập bị từ chối! Bạn không có quyền Admin.'
        ], 403);
    }
}
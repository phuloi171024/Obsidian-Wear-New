<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Kiểm tra người dùng có quyền admin không.
     * Middleware này phải dùng SAU auth:sanctum (user đã được xác thực).
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Bạn không có quyền truy cập trang này!',
            ], 403);
        }

        // Kiểm tra tài khoản có bị khoá không
        if (!$user->status) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khoá!',
            ], 403);
        }

        return $next($request);
    }
}

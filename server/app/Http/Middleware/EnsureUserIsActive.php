<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $user = $request->user();

        if (!$user || !$user->status) {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên!',
            ], 403);
        }

        return $next($request);
    }
}
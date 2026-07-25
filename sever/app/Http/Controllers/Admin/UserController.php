<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Danh sách tất cả người dùng
     * GET /admin/users
     */
    public function index(Request $request)
    {
        $query = User::withCount('orders')->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('phone', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }

        $perPage = min((int) $request->get('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Chi tiết người dùng kèm lịch sử đơn hàng
     * GET /admin/users/{id}
     */
    public function show($id)
    {
        $user = User::with([
            'orders' => fn($q) => $q->latest()->limit(10),
            'orders.items.variant.product',
            'addresses',
        ])->withCount('orders')->findOrFail($id);

        return response()->json($user);
    }

    /**
     * Khoá / Mở khoá tài khoản
     * PUT /admin/users/{id}/status
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        // Không cho phép khoá tài khoản admin
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Không thể khoá tài khoản admin!',
            ], 403);
        }

        $user->update(['status' => !$user->status]);

        $statusText = $user->status ? 'mở khoá' : 'khoá';

        return response()->json([
            'message' => "Đã {$statusText} tài khoản thành công!",
            'user'    => $user,
        ]);
    }

    /**
     * Cập nhật thông tin người dùng (chỉ admin mới làm được)
     * PUT /admin/users/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'role'  => 'sometimes|in:admin,user',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only('name', 'email', 'phone', 'role'));

        return response()->json([
            'message' => 'Cập nhật thông tin người dùng thành công!',
            'user'    => $user,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // Đăng ký
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            // Model có cast 'hashed' nên KHÔNG cần Hash::make() — truyền thẳng plain text
            'password' => $request->password,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng ký thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ], 201);
    }

    // Đăng nhập
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email hoặc mật khẩu không đúng!'], 401);
        }

        // Kiểm tra tài khoản có bị khoá không
        if (!$user->status) {
            return response()->json(['message' => 'Tài khoản của bạn đã bị khoá!'], 403);
        }

        // Xóa token cũ (nếu muốn chỉ cho 1 phiên đăng nhập)
        // $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'      => 'Đăng nhập thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => $user,
        ]);
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Đăng xuất thành công!']);
    }

    // Xem thông tin cá nhân
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // Cập nhật thông tin cá nhân
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Thêm phone để user có thể cập nhật số điện thoại
        $user->update($request->only('name', 'email', 'phone'));

        return response()->json([
            'message' => 'Cập nhật thông tin thành công!',
            'user'    => $user,
        ]);
    }

    // Đổi mật khẩu
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Mật khẩu hiện tại không đúng!'], 400);
        }

        // Model có cast 'hashed' nên KHÔNG cần Hash::make() — truyền thẳng plain text
        $user->update(['password' => $request->password]);

        // Xóa tất cả token cũ, buộc đăng nhập lại
        $user->tokens()->delete();

        return response()->json(['message' => 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.']);
    }
}
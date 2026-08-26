<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Lấy thông tin người dùng đang đăng nhập.
     * Địa chỉ được quản lý riêng bởi AddressController.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'status' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'role' => $user->role,
                'status' => (bool) $user->status,
            ],
        ], 200);
    }

    /**
     * Cập nhật tên và số điện thoại.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if ($request->has('name')) {
            $request->merge([
                'name' => trim((string) $request->input('name')),
            ]);
        }

        if ($request->has('phone')) {
            $phone = trim((string) $request->input('phone'));

            $request->merge([
                'phone' => $phone !== '' ? $phone : null,
            ]);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'name' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                ],
                'phone' => [
                    'sometimes',
                    'nullable',
                    'string',
                    'max:15',
                    Rule::unique('users', 'phone')
                        ->ignore($user->id),
                ],
            ],
            [
                'name.required' =>
                    'Vui lòng nhập họ và tên.',
                'name.max' =>
                    'Họ và tên không được vượt quá 255 ký tự.',
                'phone.max' =>
                    'Số điện thoại không được vượt quá 15 ký tự.',
                'phone.unique' =>
                    'Số điện thoại này đã được sử dụng bởi tài khoản khác.',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->fill($validator->validated());
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thông tin thành công!',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
                'role' => $user->role,
                'status' => (bool) $user->status,
            ],
        ], 200);
    }

    /**
     * Đổi mật khẩu và thu hồi toàn bộ token cũ.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate(
            [
                'current_password' => [
                    'required',
                    'string',
                ],
                'new_password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                ],
            ],
            [
                'current_password.required' =>
                    'Vui lòng nhập mật khẩu hiện tại.',
                'new_password.required' =>
                    'Vui lòng nhập mật khẩu mới.',
                'new_password.min' =>
                    'Mật khẩu mới phải có ít nhất 8 ký tự.',
                'new_password.confirmed' =>
                    'Xác nhận mật khẩu mới không khớp.',
            ]
        );

        $user = $request->user();

        if (empty($user->password)) {
            return response()->json([
                'status' => false,
                'message' =>
                    'Tài khoản Google chưa có mật khẩu. Vui lòng dùng chức năng quên mật khẩu để thiết lập mật khẩu.',
            ], 422);
        }

        if (
            !Hash::check(
                $validated['current_password'],
                $user->password
            )
        ) {
            return response()->json([
                'status' => false,
                'message' =>
                    'Mật khẩu hiện tại không chính xác!',
            ], 422);
        }

        if (
            Hash::check(
                $validated['new_password'],
                $user->password
            )
        ) {
            return response()->json([
                'status' => false,
                'message' =>
                    'Mật khẩu mới phải khác mật khẩu hiện tại!',
            ], 422);
        }

        $user->password = Hash::make(
            $validated['new_password']
        );
        $user->save();

        // Thu hồi toàn bộ phiên đăng nhập cũ.
        $user->tokens()->delete();

        return response()->json([
            'status' => true,
            'message' =>
                'Đổi mật khẩu thành công. Vui lòng đăng nhập lại!',
            'logout_required' => true,
        ], 200);
    }
}
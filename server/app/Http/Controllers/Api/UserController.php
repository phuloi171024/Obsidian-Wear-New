<?php

namespace App\Http\Controllers\Api;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash; // Thêm thư viện Hash để dùng cho Đổi mật khẩu
use App\Models\User;
use App\Models\Address;

class UserController extends Controller
{
    /**
     * Lấy thông tin hồ sơ kèm theo địa chỉ từ bảng addresses
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();

        // Lấy địa chỉ mặc định hoặc địa chỉ đầu tiên của user
        $addressRecord = $user->addresses()->where('is_default', 1)->first() 
                         ?? $user->addresses()->first();

        return response()->json([
            'status' => true,
            'data'   => [
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone ?? '',
                'address' => $addressRecord ? $addressRecord->address : '', // Đã sửa thành address
            ]
        ], 200);
    }

 public function updatePassword(Request $request)
{
    $validated = $request->validate([
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
    ], [
        'current_password.required' => 'Vui lòng nhập mật khẩu hiện tại.',
        'new_password.required' => 'Vui lòng nhập mật khẩu mới.',
        'new_password.min' => 'Mật khẩu mới phải có ít nhất 8 ký tự.',
        'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp.',
    ]);

    $user = $request->user();

    // Tài khoản Google chưa từng thiết lập mật khẩu.
    if (empty($user->password)) {
        return response()->json([
            'status' => false,
            'message' => 'Tài khoản Google chưa có mật khẩu. Vui lòng dùng chức năng quên mật khẩu để thiết lập mật khẩu.',
        ], 422);
    }

    if (!Hash::check($validated['current_password'], $user->password)) {
        return response()->json([
            'status' => false,
            'message' => 'Mật khẩu hiện tại không chính xác!',
        ], 422);
    }

    if (Hash::check($validated['new_password'], $user->password)) {
        return response()->json([
            'status' => false,
            'message' => 'Mật khẩu mới phải khác mật khẩu hiện tại!',
        ], 422);
    }

    $user->password = Hash::make($validated['new_password']);
    $user->save();

    // Thu hồi toàn bộ phiên đăng nhập sau khi đổi mật khẩu.
    $user->tokens()->delete();

    return response()->json([
        'status' => true,
        'message' => 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại!',
        'logout_required' => true,
    ]);
}

    /**
     * Cập nhật thông tin cá nhân và lưu địa chỉ vào bảng addresses
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => 'sometimes|nullable|string|max:15|unique:users,phone,' . $user->id,
            'address' => 'sometimes|nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        // Cập nhật thông tin cơ bản vào bảng users
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        $user->save();

        // Xử lý cập nhật địa chỉ sang bảng addresses
        if ($request->has('address')) {
            $addressText = $request->address;

            // Tìm địa chỉ mặc định hoặc địa chỉ đầu tiên hiện có của user
            $addressRecord = $user->addresses()->where('is_default', 1)->first() 
                             ?? $user->addresses()->first();

            if ($addressRecord) {
                // Nếu đã có thì cập nhật lại nội dung
                $addressRecord->address = $addressText; // Đã sửa thành address
                $addressRecord->save();
            } else if (!empty($addressText)) {
                // Nếu chưa có dòng địa chỉ nào thì tạo mới và set là mặc định
                Address::create([
                    'user_id'    => $user->id,
                    'address'    => $addressText, // Đã sửa thành address
                    'is_default' => 1
                ]);
            }
        }

        // Lấy lại địa chỉ sau khi cập nhật để trả về cho Client
        $updatedAddress = $user->addresses()->where('is_default', 1)->first() 
                          ?? $user->addresses()->first();

        return response()->json([
            'status'  => true,
            'message' => 'Cập nhật thông tin thành công!',
            'data'    => [
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone ?? '',
                'address' => $updatedAddress ? $updatedAddress->address : '', // Đã sửa thành address
            ]
        ], 200);
        

        $validated = $request->validate([
    'name' => [
        'required',
        'string',
        'max:255',
    ],
    'phone' => [
        'nullable',
        'string',
        'max:15',
        Rule::unique('users', 'phone')->ignore($user->id),
    ],
], [
    'name.required' => 'Vui lòng nhập họ và tên.',
    'name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
    'phone.max' => 'Số điện thoại không được vượt quá 15 ký tự.',
    'phone.unique' => 'Số điện thoại này đã được sử dụng bởi tài khoản khác.',
]);
    }
}
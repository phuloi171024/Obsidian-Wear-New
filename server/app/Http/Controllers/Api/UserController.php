<?php

namespace App\Http\Controllers\Api;

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
        // 1. Kiểm tra dữ liệu Frontend gửi lên
        $request->validate([
            'current_password' => 'required',
            // Đảm bảo mật khẩu mới phải >= 6 ký tự (có thể tùy chỉnh)
            'new_password' => 'required|min:6' 
        ]);

        $user = $request->user();

        // 2. Kiểm tra mật khẩu hiện tại có đúng không
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false, 
                'message' => 'Mật khẩu hiện tại không chính xác!'
            ], 400);
        }

        // 3. Nếu đúng, tiến hành mã hóa và lưu mật khẩu mới
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => true, 
            'message' => 'Cập nhật mật khẩu thành công!'
        ], 200);
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
    }
}
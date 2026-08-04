<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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
                'address' => $addressRecord ? $addressRecord->address_line : '',
            ]
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
                $addressRecord->address_line = $addressText;
                $addressRecord->save();
            } else if (!empty($addressText)) {
                // Nếu chưa có dòng địa chỉ nào thì tạo mới và set là mặc định
                Address::create([
                    'user_id'      => $user->id,
                    'address_line' => $addressText,
                    'is_default'   => 1
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
                'address' => $updatedAddress ? $updatedAddress->address_line : '',
            ]
        ], 200);
    }
}
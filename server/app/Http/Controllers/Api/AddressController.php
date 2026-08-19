<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Address;

class AddressController extends Controller
{
    /**
     * 1. Lấy danh sách địa chỉ của khách hàng đang đăng nhập
     */
    public function index(Request $request)
    {
        // Ưu tiên hiển thị địa chỉ mặc định lên đầu, sau đó đến địa chỉ mới tạo
        $addresses = Address::where('user_id', $request->user()->id)
                            ->orderBy('is_default', 'desc')
                            ->latest()
                            ->get();

        return response()->json([
            'status' => true,
            'data'   => $addresses
        ], 200);
    }

    /**
     * 2. Thêm một địa chỉ mới
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Thêm nullable cho is_default vì nếu không tick, React có thể không gửi lên
        $validated = $request->validate([
            'type' => 'nullable|string|max:255',
            'receiver_name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'street' => 'required|string|max:255',
            'is_default' => 'nullable|boolean'
        ]);

        // Hàm boolean() của Laravel xử lý an toàn mọi kiểu dữ liệu ('true', 1, true, 'on'...)
        $isDefault = $request->boolean('is_default', false);

        // Nếu người dùng chọn đặt làm mặc định, gỡ mặc định của tất cả địa chỉ cũ
        if ($isDefault) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        // Tạo địa chỉ mới
        $address = Address::create([
            'user_id' => $user->id,
            'type' => $validated['type'] ?? 'Nhà',
            'receiver_name' => $validated['receiver_name'],
            'phone' => $validated['phone'],
            'province' => $validated['province'],
            'district' => $validated['district'],
            'ward' => $validated['ward'],
            'street' => $validated['street'],
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Thêm địa chỉ thành công',
            'data' => $address
        ], 201);
    }

    /**
     * 3. Cập nhật địa chỉ
     */
    public function update(Request $request, int $id)
    {
        $user = $request->user();

        $address = Address::where('id', $id)
                          ->where('user_id', $user->id)
                          ->first();

        if (!$address) {
            return response()->json(['status' => false, 'message' => 'Không tìm thấy địa chỉ'], 404);
        }

        $validated = $request->validate([
            'type' => 'nullable|string|max:255',
            'receiver_name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'province' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'street' => 'required|string|max:255',
            'is_default' => 'nullable|boolean'
        ]);

        $isDefault = $request->boolean('is_default', false);

        // Nếu tick chọn "Đặt làm mặc định" và trước đó nó chưa phải là mặc định -> gỡ mặc định các địa chỉ cũ
        if ($isDefault && !$address->is_default) {
            Address::where('user_id', $user->id)
                   ->where('id', '!=', $address->id)
                   ->update(['is_default' => false]);
        }

        // Cập nhật thông tin vào DB
        $address->update([
            'type' => $validated['type'] ?? $address->type,
            'receiver_name' => $validated['receiver_name'],
            'phone' => $validated['phone'],
            'province' => $validated['province'],
            'district' => $validated['district'],
            'ward' => $validated['ward'],
            'street' => $validated['street'],
            'is_default' => $isDefault,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật địa chỉ thành công',
            'data' => $address
        ], 200);
    }

    /**
     * 4. Xóa địa chỉ
     */
    public function destroy(Request $request, int $id)
    {
        $address = Address::where('id', $id)->where('user_id', $request->user()->id)->first();

        if (!$address) {
            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy địa chỉ để xóa!'
            ], 404);
        }

        $address->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Đã xóa địa chỉ thành công!'
        ], 200);
    }
}
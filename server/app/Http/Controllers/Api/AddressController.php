<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Address;

class AddressController extends Controller
{
    /**
     * 1. Lấy danh sách địa chỉ của khách hàng đang đăng nhập
     */
    public function index(Request $request)
    {
        // Chỉ lấy địa chỉ của user này, ưu tiên hiển thị địa chỉ mặc định lên đầu
        $addresses = Address::where('user_id', $request->user()->id)
                            ->orderBy('is_default', 'desc')
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

        // Xác thực dữ liệu với các trường chi tiết mới
        $request->validate([
            'type' => 'required|string',
            'receiver_name' => 'required|string',
            'phone' => 'required|string',
            'province' => 'required|string',
            'district' => 'required|string',
            'ward' => 'required|string',
            'street' => 'required|string',
            'is_default' => 'boolean'
        ]);

        // Nếu người dùng chọn đặt làm mặc định, gỡ mặc định của tất cả địa chỉ cũ
        if ($request->input('is_default')) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        // Tạo địa chỉ mới
        $address = Address::create([
            'user_id' => $user->id,
            'type' => $request->type,
            'receiver_name' => $request->receiver_name,
            'phone' => $request->phone,
            'province' => $request->province,
            'district' => $request->district,
            'ward' => $request->ward,
            'street' => $request->street,
            'is_default' => $request->is_default ?? false,
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

        // Xác thực dữ liệu với các trường chi tiết mới
        $request->validate([
            'type' => 'required|string',
            'receiver_name' => 'required|string',
            'phone' => 'required|string',
            'province' => 'required|string',
            'district' => 'required|string',
            'ward' => 'required|string',
            'street' => 'required|string',
            'is_default' => 'boolean'
        ]);

        // Nếu người dùng tick chọn "Đặt làm mặc định" khi sửa, gỡ mặc định các địa chỉ cũ
        if ($request->input('is_default')) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        // Cập nhật thông tin vào DB
        $address->update([
            'type' => $request->type,
            'receiver_name' => $request->receiver_name,
            'phone' => $request->phone,
            'province' => $request->province,
            'district' => $request->district,
            'ward' => $request->ward,
            'street' => $request->street,
            'is_default' => $request->is_default ?? $address->is_default,
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
        // Chỉ cho phép xóa địa chỉ của chính mình
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
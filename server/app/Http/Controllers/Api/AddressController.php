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
        $validator = Validator::make($request->all(), [
            'address_line' => 'required|string|max:255',
            'is_default'   => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $user = $request->user();
        $isDefault = $request->is_default ?? false;

        // Nếu khách hàng chọn đây là địa chỉ mặc định, ta phải tắt mặc định của các địa chỉ cũ đi
        if ($isDefault) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        // Tạo địa chỉ mới
        $address = Address::create([
            'user_id'      => $user->id,
            'address_line' => $request->address_line,
            'is_default'   => $isDefault,
        ]);

        return response()->json([
            'status'  => true,
            'message' => 'Thêm địa chỉ thành công!',
            'data'    => $address
        ], 201);
    }

    /**
     * 3. Cập nhật địa chỉ
     */
    public function update(Request $request, int $id)
    {
        $user = $request->user();
        
        // Tìm địa chỉ theo ID và phải đảm bảo nó thuộc về user đang đăng nhập
        $address = Address::where('id', $id)->where('user_id', $user->id)->first();

        if (!$address) {
            return response()->json([
                'status'  => false,
                'message' => 'Không tìm thấy địa chỉ!'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'address_line' => 'sometimes|required|string|max:255',
            'is_default'   => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        // Nếu cập nhật thành địa chỉ mặc định
        if ($request->has('is_default') && $request->is_default) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
            $address->is_default = true;
        }

        if ($request->has('address_line')) {
            $address->address_line = $request->address_line;
        }

        $address->save();

        return response()->json([
            'status'  => true,
            'message' => 'Cập nhật địa chỉ thành công!',
            'data'    => $address
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
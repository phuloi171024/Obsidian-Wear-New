<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    /**
     * Danh sách địa chỉ của user
     * GET /addresses
     */
    public function index(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderByDesc('is_default')
            ->get();

        return response()->json($addresses);
    }

    /**
     * Thêm địa chỉ mới
     * POST /addresses
     * Body: { address_line, is_default? }
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'address_line' => 'required|string|max:500',
            'is_default'   => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Nếu đặt làm mặc định thì bỏ mặc định của địa chỉ cũ
        if ($request->boolean('is_default')) {
            Address::where('user_id', $user->id)->update(['is_default' => false]);
        }

        $address = Address::create([
            'user_id'      => $user->id,
            'address_line' => $request->address_line,
            'is_default'   => $request->boolean('is_default', false),
        ]);

        return response()->json([
            'message' => 'Đã thêm địa chỉ!',
            'address' => $address,
        ], 201);
    }

    /**
     * Cập nhật địa chỉ
     * PUT /addresses/{id}
     */
    public function update(Request $request, $id)
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'address_line' => 'sometimes|string|max:500',
            'is_default'   => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->boolean('is_default')) {
            Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
        }

        $address->update($request->only('address_line', 'is_default'));

        return response()->json([
            'message' => 'Đã cập nhật địa chỉ!',
            'address' => $address,
        ]);
    }

    /**
     * Xóa địa chỉ
     * DELETE /addresses/{id}
     */
    public function destroy(Request $request, $id)
    {
        $address = Address::where('user_id', $request->user()->id)->findOrFail($id);
        $address->delete();

        return response()->json(['message' => 'Đã xóa địa chỉ!']);
    }

    /**
     * Đặt làm địa chỉ mặc định
     * PUT /addresses/{id}/default
     */
    public function setDefault(Request $request, $id)
    {
        $user = $request->user();
        $address = Address::where('user_id', $user->id)->findOrFail($id);

        // Bỏ mặc định của tất cả địa chỉ hiện tại
        Address::where('user_id', $user->id)->update(['is_default' => false]);

        // Đặt địa chỉ này làm mặc định
        $address->update(['is_default' => true]);

        return response()->json([
            'message' => 'Đã đặt làm địa chỉ mặc định!',
            'address' => $address,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'status' => true,
            'data' => Address::where('user_id', $request->user()->id)
                ->orderByDesc('is_default')->latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $user = $request->user();

        $address = DB::transaction(function () use ($user, $data, $request) {
            $isDefault = $request->boolean('is_default') ||
                !Address::where('user_id', $user->id)->exists();
            if ($isDefault) {
                Address::where('user_id', $user->id)->update(['is_default' => false]);
            }
            return Address::create([...$data, 'user_id' => $user->id, 'is_default' => $isDefault]);
        });

        return response()->json(['status' => true, 'message' => 'Thêm địa chỉ thành công', 'data' => $address], 201);
    }

    public function update(Request $request, int $id)
    {
        $address = Address::where('user_id', $request->user()->id)->find($id);
        if (!$address) return response()->json(['status' => false, 'message' => 'Không tìm thấy địa chỉ'], 404);
        $data = $this->validated($request);

        DB::transaction(function () use ($address, $data, $request) {
            $isDefault = $request->boolean('is_default');
            if ($isDefault) {
                Address::where('user_id', $address->user_id)->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            } elseif ($address->is_default) {
                $isDefault = true;
            }
            $address->update([...$data, 'is_default' => $isDefault]);
        });

        return response()->json(['status' => true, 'message' => 'Cập nhật địa chỉ thành công', 'data' => $address->fresh()]);
    }

    public function destroy(Request $request, int $id)
    {
        $address = Address::where('user_id', $request->user()->id)->find($id);
        if (!$address) return response()->json(['status' => false, 'message' => 'Không tìm thấy địa chỉ để xóa!'], 404);

        DB::transaction(function () use ($address) {
            $wasDefault = $address->is_default;
            $userId = $address->user_id;
            $address->delete();
            if ($wasDefault) {
                Address::where('user_id', $userId)->latest()->first()?->update(['is_default' => true]);
            }
        });

        return response()->json(['status' => true, 'message' => 'Đã xóa địa chỉ. Địa chỉ trong đơn cũ vẫn được giữ nguyên.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'type' => ['nullable', 'string', 'max:50'],
            'receiver_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'regex:/^[0-9]{9,11}$/'],
            'province_code' => ['required', 'string', 'max:20'],
            'province' => ['required', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'ward_code' => ['required', 'string', 'max:20'],
            'ward' => ['required', 'string', 'max:100'],
            'street' => ['required', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ]);
    }
}

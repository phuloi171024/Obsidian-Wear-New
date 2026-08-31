<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Services\CheckoutPricingService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ShippingController extends Controller
{
    public function __construct(private readonly CheckoutPricingService $pricing) {}

    public function quote(Request $request)
    {
        $data = $request->validate([
            'address_id' => ['nullable', 'integer'],
            'province' => ['nullable', 'string', 'max:100'],
            'shipping_method' => ['required', Rule::in(['economy', 'standard', 'express'])],
            'product_coupon_id' => ['nullable', 'integer'],
            'shipping_coupon_id' => ['nullable', 'integer'],
        ]);

        $province = $data['province'] ?? null;
        if (!empty($data['address_id'])) {
            $address = Address::where('user_id', $request->user()->id)->find($data['address_id']);
            abort_unless($address, 422, 'Địa chỉ không hợp lệ!');
            $province = $address->province;
        }

        try {
            $quote = $this->pricing->quote(
                $request->user(), $data['shipping_method'],
                $data['product_coupon_id'] ?? null,
                $data['shipping_coupon_id'] ?? null,
                $province
            );
            unset($quote['items']);
            return response()->json(['status' => true, 'data' => $quote]);
        } catch (\RuntimeException $e) {
            return response()->json(['status' => false, 'message' => $e->getMessage()], 422);
        }
    }
}

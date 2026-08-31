<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $query = $this->withUsageCounts(Coupon::query())->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }
        if ($request->filled('search')) {
            $query->where('code', 'like', '%' . $request->search . '%');
        }

        return response()->json(
            $query->get()->map(fn (Coupon $coupon) => $this->usagePayload($coupon))
        );
    }

    public function store(Request $request)
    {
        $this->normalizeInput($request);
        $validator = Validator::make($request->all(), $this->rules());
        $this->addPercentRule($validator, $request->input('discount_type'));
        $this->addDateRangeRules($validator, $request);

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $coupon = Coupon::create($validator->validated());

        return response()->json([
            'message' => 'Tạo mã giảm giá thành công!',
            'coupon' => $this->freshWithUsageCounts($coupon),
        ], 201);
    }

    public function show(int $id)
    {
        $coupon = $this->withUsageCounts(Coupon::query())->findOrFail($id);
        return response()->json($this->usagePayload($coupon));
    }

    public function update(Request $request, int $id)
    {
        $coupon = Coupon::findOrFail($id);
        $this->normalizeInput($request, $coupon);

        $validator = Validator::make($request->all(), $this->rules($coupon));
        $this->addPercentRule(
            $validator,
            $request->input('discount_type', $coupon->discount_type)
        );
        $this->addDateRangeRules($validator, $request);

        $validator->after(function ($validator) use ($request, $coupon) {
            $reserved = $coupon->userUsages()->where('status', 'reserved')->count();
            $committed = (int) $coupon->used_count + $reserved;
            $globalLimit = $request->exists('usage_limit')
                ? $request->input('usage_limit')
                : $coupon->usage_limit;

            if ($globalLimit !== null && (int) $globalLimit < $committed) {
                $validator->errors()->add(
                    'usage_limit',
                    "Số lượt tổng không được nhỏ hơn {$committed} lượt đã dùng/đang giữ."
                );
            }

            $perUserLimit = $request->exists('per_user_limit')
                ? $request->input('per_user_limit')
                : $coupon->per_user_limit;

            if ($perUserLimit !== null) {
                $maxUsedByOneUser = (int) $coupon->userUsages()
                    ->select('user_id', DB::raw('COUNT(*) as usage_count'))
                    ->groupBy('user_id')
                    ->orderByDesc('usage_count')
                    ->value('usage_count');

                if ((int) $perUserLimit < $maxUsedByOneUser) {
                    $validator->errors()->add(
                        'per_user_limit',
                        "Giới hạn mỗi tài khoản không được nhỏ hơn {$maxUsedByOneUser}."
                    );
                }
            }
        });

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $coupon->update($validator->validated());

        return response()->json([
            'message' => 'Cập nhật mã giảm giá thành công!',
            'coupon' => $this->freshWithUsageCounts($coupon),
        ]);
    }

    public function destroy(int $id)
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['message' => 'Đã xoá mã giảm giá thành công!']);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:coupons,id',
        ]);

        Coupon::whereIn('id', $request->ids)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xoá các mã giảm giá được chọn thành công!',
        ]);
    }

    private function rules(?Coupon $coupon = null): array
    {
        $updating = $coupon !== null;
        $required = $updating ? 'sometimes' : 'required';

        return [
            'code' => [
                $required, 'string', 'max:50',
                Rule::unique('coupons', 'code')->ignore($coupon?->id),
            ],
            'discount_type' => [$required, 'string', Rule::in(['fixed', 'percent', 'shipping'])],
            'discount_value' => [$required, 'numeric', 'min:0'],
            'min_order_value' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => [$required, 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'status' => [$updating ? 'sometimes' : 'nullable', 'boolean'],
        ];
    }

    private function addPercentRule($validator, ?string $discountType): void
    {
        $validator->sometimes(
            'discount_value',
            'max:100',
            fn () => $discountType === 'percent'
        );
    }

    private function addDateRangeRules($validator, Request $request): void
    {
        foreach (['expires_at', 'end_date'] as $field) {
            $validator->sometimes(
                $field,
                'after:starts_at',
                fn () => $request->filled('starts_at') && $request->filled($field)
            );
        }
    }

    private function normalizeInput(Request $request, ?Coupon $coupon = null): void
    {
        $type = (string) $request->input('discount_type', $coupon?->discount_type ?? 'fixed');
        $data = [];

        if ($request->has('code')) {
            $data['code'] = mb_strtoupper(trim((string) $request->input('code')));
        }

        foreach (['usage_limit', 'per_user_limit'] as $field) {
            if ($request->exists($field)) {
                $value = $request->input($field);
                $data[$field] = $value === '' || $value === null ? null : (int) $value;
            }
        }

        foreach (['discount_value', 'min_order_value'] as $field) {
            if (!$request->exists($field)) continue;
            $value = $request->input($field);

            if ($field === 'discount_value' && $type === 'percent') {
                $data[$field] = str_replace(',', '.', trim((string) $value));
            } else {
                // 10.000, 10,000 và 10 000 đều được lưu thành 10000.
                $digits = preg_replace('/[^0-9]/', '', (string) $value);
                $data[$field] = $digits === '' ? null : (int) $digits;
            }
        }

        foreach (['starts_at', 'expires_at', 'end_date'] as $field) {
            if ($request->exists($field) && $request->input($field) === '') {
                $data[$field] = null;
            }
        }

        $request->merge($data);
    }

    private function withUsageCounts($query)
    {
        return $query->withCount([
            'userUsages as reserved_count' => fn ($query) => $query->where('status', 'reserved'),
        ]);
    }

    private function freshWithUsageCounts(Coupon $coupon): array
    {
        $fresh = $this->withUsageCounts(Coupon::query())->findOrFail($coupon->id);
        return $this->usagePayload($fresh);
    }

    private function usagePayload(Coupon $coupon): array
    {
        $reserved = (int) ($coupon->reserved_count ?? 0);
        $committed = (int) $coupon->used_count + $reserved;
        $remaining = $coupon->usage_limit === null
            ? null
            : max(0, (int) $coupon->usage_limit - $committed);

        return [
            ...$coupon->toArray(),
            'reserved_count' => $reserved,
            'remaining_count' => $remaining,
        ];
    }

    private function validationError($validator)
    {
        return response()->json([
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors(),
        ], 422);
    }
}

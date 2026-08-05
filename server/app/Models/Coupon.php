<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'discount_type',
        'discount_value',
        'min_order_value',
        'usage_limit',
        'used_count',
        'expires_at',
        'status',
    ];

    // Một mã giảm giá có thể được áp dụng cho nhiều đơn hàng
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
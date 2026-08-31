<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderCoupon extends Model
{
    protected $fillable = [
        'order_id', 'coupon_id', 'coupon_kind', 'code_snapshot',
        'discount_type_snapshot', 'discount_value_snapshot',
        'discount_amount', 'status', 'reserved_at', 'used_at', 'released_at',
    ];

    protected $casts = [
        'discount_value_snapshot' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'reserved_at' => 'datetime', 'used_at' => 'datetime', 'released_at' => 'datetime',
    ];

    public function order() { return $this->belongsTo(Order::class); }
    public function coupon() { return $this->belongsTo(Coupon::class)->withTrashed(); }
}

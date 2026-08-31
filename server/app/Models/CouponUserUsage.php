<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponUserUsage extends Model
{
    protected $fillable = [
        'user_id', 'coupon_id', 'order_id', 'status', 'reserved_at', 'used_at',
    ];

    protected $casts = ['reserved_at' => 'datetime', 'used_at' => 'datetime'];

    public function user() { return $this->belongsTo(User::class); }
    public function coupon() { return $this->belongsTo(Coupon::class)->withTrashed(); }
    public function order() { return $this->belongsTo(Order::class); }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = ['user_id', 'coupon_id', 'total_amount', 'status'];

    // Đơn hàng thuộc về 1 người dùng [cite: 64]
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Đơn hàng có thể có 1 mã giảm giá [cite: 149]
    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    // Một đơn hàng có nhiều sản phẩm mua (Chi tiết đơn hàng) [cite: 64]
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
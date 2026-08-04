<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 
        'coupon_id', 
        'total_amount', 
        'status'
    ];

    // Đơn hàng thuộc về 1 người dùng
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Đơn hàng có thể có 1 mã giảm giá
    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    // Một đơn hàng có nhiều sản phẩm mua (Chi tiết đơn hàng)
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
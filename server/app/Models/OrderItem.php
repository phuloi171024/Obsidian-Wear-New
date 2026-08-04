<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 
class OrderItem extends Model
{
    use SoftDeletes;

    protected $fillable = ['order_id', 'product_variant_id', 'quantity', 'price']; 
    // Thuộc về đơn hàng nào [cite: 65]
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Liên kết tới biến thể sản phẩm được mua [cite: 150]
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
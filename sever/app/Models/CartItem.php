<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    protected $fillable = ['cart_id', 'product_variant_id', 'quantity'];

    // Item thuộc về 1 giỏ hàng
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    // Item liên kết tới biến thể sản phẩm
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}

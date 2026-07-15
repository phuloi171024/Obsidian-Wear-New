<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 
class ProductVariant extends Model
{
    use SoftDeletes;

    protected $fillable = ['product_id', 'color', 'size', 'stock']; 

    // Biến thể này thuộc về sản phẩm nào [cite: 153]
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    // Một biến thể (size/màu) có thể nằm trong giỏ hàng của nhiều khách hàng khác nhau
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
}
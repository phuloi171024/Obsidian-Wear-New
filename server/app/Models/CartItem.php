<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_variant_id',
        'quantity',
    ];

    // Một dòng trong giỏ hàng thuộc về 1 Khách hàng (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Tham chiếu đến đúng 1 Biến thể sản phẩm (Size/Màu)
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
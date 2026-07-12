<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    // 1. Cho phép thêm dữ liệu an toàn (Mass Assignment)
    protected $fillable = [
        'user_id',
        'product_variant_id',
        'quantity',
    ];

    // 2. Liên kết nghịch: Một dòng trong giỏ hàng sẽ thuộc về 1 Khách hàng (User)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // 3. Liên kết nghịch: Một dòng trong giỏ hàng sẽ tham chiếu đến đúng 1 Biến thể sản phẩm (Size/Màu)
    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class);
    }
}
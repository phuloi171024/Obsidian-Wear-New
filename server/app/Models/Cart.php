<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id'
    ];

    // Giỏ hàng thuộc về 1 user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Giỏ hàng có nhiều sản phẩm chi tiết trong giỏ
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }
}
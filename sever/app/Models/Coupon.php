<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'discount_value',
        'end_date',
        'status',
    ];

    protected $casts = [
        'status'       => 'boolean',
        'end_date'     => 'datetime',
        'discount_value' => 'decimal:2',
    ];

    // Một coupon có thể được dùng trong nhiều đơn hàng
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Kiểm tra coupon còn hiệu lực không
     */
    public function isValid(): bool
    {
        if (!$this->status) {
            return false;
        }

        if ($this->end_date && $this->end_date->isPast()) {
            return false;
        }

        return true;
    }
}

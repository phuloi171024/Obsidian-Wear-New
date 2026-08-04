<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class FlashSale extends Model
{
    protected $fillable = ['name', 'discount_percent', 'start_time', 'end_time', 'status'];

    protected $casts = [
        'start_time'       => 'datetime',
        'end_time'         => 'datetime',
        'status'           => 'boolean',
        'discount_percent' => 'float',
    ];

    // Flash sale có nhiều sản phẩm (qua bảng trung gian)
    public function products()
    {
        return $this->belongsToMany(Product::class, 'flash_sale_products')
                    ->withPivot('discount_percent')
                    ->withTimestamps();
    }

    // Kiểm tra flash sale đang diễn ra
    public function isActive(): bool
    {
        $now = Carbon::now();
        return $this->status
            && $now->between($this->start_time, $this->end_time);
    }

    // Accessor trạng thái hiển thị
    public function getDisplayStatusAttribute(): string
    {
        $now = Carbon::now();
        if (!$this->status) return 'disabled';
        if ($now->lt($this->start_time)) return 'upcoming';
        if ($now->between($this->start_time, $this->end_time)) return 'active';
        return 'ended';
    }
}

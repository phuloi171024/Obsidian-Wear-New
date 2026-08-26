<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id', 
        'brand_id', 
        'name', 
        'slug', 
        'sku', 
        'price',
        'sale_price',
        'deal_label',
        'sale_starts_at',
        'sale_ends_at',
        'thumbnail', 
        'description', 
        'status',
        'is_featured',
        'sport_type',
    ];

    protected $appends = [
        'is_on_sale',
        'current_price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'status' => 'boolean',
            'is_featured' => 'boolean',
            'sale_starts_at' => 'datetime',
            'sale_ends_at' => 'datetime',
        ];
    }

    public function getIsOnSaleAttribute(): bool
    {
        if ($this->sale_price === null || (float) $this->sale_price >= (float) $this->price) {
            return false;
        }

        $now = now();

        if ($this->sale_starts_at && $now->lt($this->sale_starts_at)) {
            return false;
        }

        if ($this->sale_ends_at && $now->gt($this->sale_ends_at)) {
            return false;
        }

        return true;
    }

    public function getCurrentPriceAttribute(): float
    {
        return $this->is_on_sale
            ? (float) $this->sale_price
            : (float) $this->price;
    }

    // Sản phẩm thuộc về 1 danh mục
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Sản phẩm thuộc về 1 thương hiệu 
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    // Một sản phẩm có nhiều ảnh chi tiết
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    // Một sản phẩm có nhiều biến thể màu sắc, kích thước
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Một sản phẩm có nhiều đánh giá
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}

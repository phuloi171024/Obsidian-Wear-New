<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 
class Product extends Model
{
    use SoftDeletes;

    protected $fillable = ['category_id', 'brand_id', 'name', 'slug', 'sku', 'price', 'thumbnail', 'description', 'status']; 

    // Sản phẩm thuộc về 1 danh mục [cite: 61]
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Sản phẩm thuộc về 1 thương hiệu 
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    // Một sản phẩm có nhiều ảnh chi tiết [cite: 152]
    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    // Một sản phẩm có nhiều biến thể màu sắc, kích thước [cite: 153]
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    // Một sản phẩm có nhiều đánh giá [cite: 154]
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
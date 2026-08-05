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
        'thumbnail', 
        'description', 
        'status'
    ]; 

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
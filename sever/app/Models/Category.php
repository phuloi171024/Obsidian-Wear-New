<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Bảng của em có deleted_at

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'status'];

    // Một danh mục có nhiều sản phẩm 
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
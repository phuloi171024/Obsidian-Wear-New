<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 

class Brand extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 
        'slug', 
        'logo_url',
        'status',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'is_featured' => 'boolean',
        ];
    }

    // Một thương hiệu có nhiều sản phẩm
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}

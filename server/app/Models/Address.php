<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use HasFactory, SoftDeletes;

    // Sửa lại danh sách $fillable khớp chính xác 100% với bảng addresses trong DB
protected $fillable = [
    'user_id',
    'type',
    'receiver_name',
    'phone',
    'province',
    'district',
    'ward',
    'street',
    'is_default'
];

    // Địa chỉ thuộc về một người dùng
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
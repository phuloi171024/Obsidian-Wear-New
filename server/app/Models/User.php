<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// 👇 Khai báo đầy đủ các Model quan hệ để VS Code hết báo vạch đỏ P1009
use App\Models\Address;
use App\Models\Order;
use App\Models\Review;
use App\Models\CartItem;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'google_id', // Trường nhận ID từ Google
        'role',      // Phân quyền
        'status',    // Trạng thái hoạt động
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Một người dùng có nhiều đơn hàng
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Một người dùng có nhiều địa chỉ nhận hàng
    public function addresses()
    {
        return $this->hasMany(Address::class, 'user_id', 'id');
    }

    // Một người dùng có nhiều đánh giá sản phẩm
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Một người dùng có nhiều sản phẩm trong giỏ hàng
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
}
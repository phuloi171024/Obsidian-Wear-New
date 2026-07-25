<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
        'role',
        'status',
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
            'password'          => 'hashed',
            'status'            => 'boolean',
        ];
    }

    /**
     * Kiểm tra người dùng có phải admin không.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Một người dùng có nhiều đơn hàng
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Một người dùng có nhiều địa chỉ nhận hàng
    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    // Một người dùng có nhiều đánh giá sản phẩm
    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
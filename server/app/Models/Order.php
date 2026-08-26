<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'coupon_id',
        'address_id',
        'note',
        'total_amount',
        'status',

        // Thông tin thanh toán
        'payment_method',
        'payment_status',
        'vnpay_txn_ref',
        'vnpay_transaction_no',
        'vnpay_response_code',
        'paid_at',
        'payment_expires_at',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'payment_expires_at' => 'datetime',
    ];

    /**
     * Người đặt hàng.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Voucher của đơn hàng.
     */
    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    /**
     * Các sản phẩm trong đơn hàng.
     */
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Địa chỉ giao hàng.
     */
    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function vnpayPaymentAttempts()
    {
        return $this->hasMany(VNPayPaymentAttempt::class);
    }
}

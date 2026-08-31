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
        'subtotal',
        'shipping_method',
        'shipping_fee',
        'discount_amount',
        'shipping_discount',
        'total_amount',
        'status',
        'shipping_receiver_name',
        'shipping_phone',
        'shipping_address_type',
        'shipping_province_code',
        'shipping_province',
        'shipping_district',
        'shipping_ward_code',
        'shipping_ward',
        'shipping_street',

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
        'subtotal' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_discount' => 'decimal:2',
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
        return $this->belongsTo(Address::class)->withTrashed();
    }

    public function orderCoupons()
    {
        return $this->hasMany(OrderCoupon::class);
    }

    public function vnpayPaymentAttempts()
    {
        return $this->hasMany(VNPayPaymentAttempt::class);
    }
}

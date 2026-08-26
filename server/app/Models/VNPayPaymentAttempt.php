<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VNPayPaymentAttempt extends Model
{
    use HasFactory;

    protected $table = 'vnpay_payment_attempts';

    protected $fillable = [
        'order_id',
        'txn_ref',
        'amount',
        'status',
        'transaction_no',
        'response_code',
        'expires_at',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}

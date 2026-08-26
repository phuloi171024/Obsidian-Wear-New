<?php

return [
    'tmn_code'    => env('VNP_TMN_CODE', ''),
    'hash_secret' => env('VNP_HASH_SECRET', ''),
    'url'         => env('VNP_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
    'return_url'  => env('VNP_RETURN_URL', ''),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'expire_minutes' => (int) env('VNP_EXPIRE_MINUTES', 15),
    'order_expire_minutes' => (int) env('VNP_ORDER_EXPIRE_MINUTES', 30),
];

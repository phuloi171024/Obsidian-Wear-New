<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderSuccessMail;
use App\Models\Order;
use App\Models\VNPayPaymentAttempt;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class VNPayController extends Controller
{
    private const VNPAY_TIMEZONE = 'Asia/Ho_Chi_Minh';

    /**
     * Tạo URL thanh toán VNPay cho đơn hàng của người dùng đang đăng nhập.
     * Số tiền luôn được lấy từ database, không lấy từ frontend.
     */
    public function createPayment(Request $request)
    {
        $validated = $request->validate([
            'order_id' => [
                'required',
                'integer',
                'min:1',
            ],
        ]);

        try {
            $tmnCode = (string) config('vnpay.tmn_code', '');
            $hashSecret = (string) config('vnpay.hash_secret', '');
            $paymentUrl = (string) config('vnpay.url', '');
            $returnUrl = (string) config('vnpay.return_url', '');

            if (
                $tmnCode === '' ||
                $hashSecret === '' ||
                $paymentUrl === '' ||
                $returnUrl === ''
            ) {
                Log::error('Cấu hình VNPay chưa đầy đủ.');

                return response()->json([
                    'success' => false,
                    'status' => false,
                    'message' => 'Cấu hình VNPay chưa đầy đủ!',
                ], 500);
            }

            $now = Carbon::now(self::VNPAY_TIMEZONE);
            $expireMinutes = max(
                5,
                (int) config('vnpay.expire_minutes', 15)
            );
            $expiresAt = $now->copy()->addMinutes($expireMinutes);

            $payment = DB::transaction(function () use (
                $request,
                $validated,
                $now,
                $expiresAt
            ) {
                $order = Order::query()
                    ->where('id', $validated['order_id'])
                    ->where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->first();

                if (!$order) {
                    throw new \RuntimeException(
                        'Không tìm thấy đơn hàng của bạn!'
                    );
                }

                if ($order->payment_method !== 'vnpay') {
                    throw new \RuntimeException(
                        'Đơn hàng này không sử dụng phương thức VNPay!'
                    );
                }

                if ($order->status === 'cancelled') {
                    throw new \RuntimeException(
                        'Đơn hàng đã bị hủy!'
                    );
                }

                if ($order->status === 'completed') {
                    throw new \RuntimeException(
                        'Đơn hàng đã hoàn tất!'
                    );
                }

                if ($order->payment_status === 'paid') {
                    throw new \RuntimeException(
                        'Đơn hàng này đã được thanh toán!'
                    );
                }

                if ((float) $order->total_amount <= 0) {
                    throw new \RuntimeException(
                        'Tổng tiền đơn hàng không hợp lệ!'
                    );
                }

                // Mỗi lần thanh toán/retry phải có một mã tham chiếu mới.
                $txnRef = sprintf(
                    'ORD%d-%s-%s',
                    $order->id,
                    $now->format('YmdHis'),
                    Str::upper(Str::random(10))
                );

                $order->vnpayPaymentAttempts()
                    ->where('status', 'pending')
                    ->update(['status' => 'expired']);

                $attempt = $order->vnpayPaymentAttempts()->create([
                    'txn_ref' => $txnRef,
                    'amount' => $order->total_amount,
                    'status' => 'pending',
                    'expires_at' => $expiresAt,
                ]);

                $order->update([
                    'payment_status' => 'pending',
                    'vnpay_txn_ref' => $txnRef,
                    'vnpay_transaction_no' => null,
                    'vnpay_response_code' => null,
                    'paid_at' => null,
                    'payment_expires_at' => $expiresAt,
                ]);

                return [
                    'order' => $order->fresh(),
                    'attempt' => $attempt,
                ];
            }, 3);

            $order = $payment['order'];
            $attempt = $payment['attempt'];

            // VNPay yêu cầu số tiền VND được nhân 100.
            $amount = (int) round(
                (float) $order->total_amount * 100
            );

            $inputData = [
                'vnp_Version' => '2.1.0',
                'vnp_TmnCode' => $tmnCode,
                'vnp_Amount' => $amount,
                'vnp_Command' => 'pay',
                'vnp_CreateDate' => $now->format('YmdHis'),
                'vnp_CurrCode' => 'VND',
                'vnp_IpAddr' => $request->ip(),
                'vnp_Locale' => 'vn',
                'vnp_OrderInfo' =>
                    'Thanh toan don hang Obsidian Wear ma ' . $order->id,
                'vnp_OrderType' => 'other',
                'vnp_ReturnUrl' => $returnUrl,
                'vnp_TxnRef' => $attempt->txn_ref,
                'vnp_ExpireDate' => $expiresAt->format('YmdHis'),
            ];

            $hashData = $this->buildHashData($inputData);
            $secureHash = hash_hmac(
                'sha512',
                $hashData,
                $hashSecret
            );

            $redirectUrl = rtrim($paymentUrl, '?') .
                '?' .
                $hashData .
                '&vnp_SecureHash=' .
                $secureHash;

            return response()->json([
                'success' => true,
                'status' => true,
                'message' => 'Tạo URL thanh toán thành công!',
                'data' => $redirectUrl,
                'url' => $redirectUrl,
                'expires_at' => $attempt->expires_at?->toIso8601String(),
            ]);
        } catch (\RuntimeException $exception) {
            return response()->json([
                'success' => false,
                'status' => false,
                'message' => $exception->getMessage(),
            ], 422);
        } catch (\Throwable $exception) {
            Log::error('Lỗi tạo URL thanh toán VNPay', [
                'user_id' => $request->user()?->id,
                'order_id' => $validated['order_id'] ?? null,
                'message' => $exception->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'status' => false,
                'message' => 'Không thể tạo liên kết thanh toán VNPay!',
            ], 500);
        }
    }

    /**
     * Return URL được trình duyệt người dùng truy cập sau thanh toán.
     * Theo quy trình VNPay, method này chỉ xác minh và chuyển hướng giao diện;
     * việc cập nhật database được thực hiện tại IPN.
     */
    public function vnpayReturn(Request $request)
    {
        $frontendUrl = rtrim(
            (string) config(
                'vnpay.frontend_url',
                'http://localhost:5173'
            ),
            '/'
        );

        try {
            $inputData = $this->extractVnpayData($request);
            $txnRef = (string) ($inputData['vnp_TxnRef'] ?? '');
            $orderId = VNPayPaymentAttempt::query()
                ->where('txn_ref', $txnRef)
                ->value('order_id');

            // Hỗ trợ giao dịch cũ được tạo trước migration payment attempts.
            $orderId ??= $this->extractOrderId($txnRef);

            if (!$this->hasValidSignature($inputData)) {
                Log::warning('Sai chữ ký VNPay Return', [
                    'ip' => $request->ip(),
                    'txn_ref' => $txnRef,
                ]);

                return redirect()->away(
                    $frontendUrl .
                    '/checkout/failed?' .
                    http_build_query([
                        'payment' => 'failed',
                        'reason' => 'invalid_signature',
                        'order_id' => $orderId,
                    ])
                );
            }

            $responseCode = (string) (
                $inputData['vnp_ResponseCode'] ?? ''
            );
            $transactionStatus = (string) (
                $inputData['vnp_TransactionStatus'] ?? ''
            );

            $isSuccessful =
                $responseCode === '00' &&
                $transactionStatus === '00';

            if ($isSuccessful && $orderId !== null) {
                return redirect()->away(
                    $frontendUrl .
                    '/checkout/success?' .
                    http_build_query([
                        'order_id' => $orderId,
                        'payment' => 'vnpay',
                    ])
                );
            }

            return redirect()->away(
                $frontendUrl .
                '/checkout/failed?' .
                http_build_query([
                    'payment' => 'failed',
                    'reason' => $responseCode ?: 'unknown',
                    'order_id' => $orderId,
                ])
            );
        } catch (\Throwable $exception) {
            Log::error('Lỗi xử lý VNPay Return', [
                'message' => $exception->getMessage(),
                'ip' => $request->ip(),
            ]);

            return redirect()->away(
                $frontendUrl .
                '/checkout/failed?' .
                http_build_query([
                    'payment' => 'failed',
                    'reason' => 'system_error',
                ])
            );
        }
    }

    /**
     * IPN server-to-server dùng để cập nhật kết quả thanh toán vào database.
     */
    public function vnpayIpn(Request $request)
    {
        try {
            $inputData = $this->extractVnpayData($request);

            if (!$this->hasValidSignature($inputData)) {
                return $this->ipnResponse(
                    '97',
                    'Invalid signature'
                );
            }

            $txnRef = (string) ($inputData['vnp_TxnRef'] ?? '');
            $attemptOrderId = VNPayPaymentAttempt::query()
                ->where('txn_ref', $txnRef)
                ->value('order_id');
            $orderId = $attemptOrderId ?? $this->extractOrderId($txnRef);

            if ($orderId === null) {
                return $this->ipnResponse(
                    '01',
                    'Order not found'
                );
            }

            $receivedAmount = $inputData['vnp_Amount'] ?? null;

            if (
                $receivedAmount === null ||
                !ctype_digit((string) $receivedAmount)
            ) {
                return $this->ipnResponse(
                    '04',
                    'Invalid amount'
                );
            }

            $result = DB::transaction(function () use (
                $inputData,
                $txnRef,
                $orderId,
                $receivedAmount
            ) {
                $attempt = VNPayPaymentAttempt::query()
                    ->where('txn_ref', $txnRef)
                    ->lockForUpdate()
                    ->first();

                $order = Order::query()
                    ->where('id', $attempt?->order_id ?? $orderId)
                    ->lockForUpdate()
                    ->first();

                if (!$order || $order->payment_method !== 'vnpay') {
                    return [
                        'code' => '01',
                        'message' => 'Order not found',
                        'send_mail' => false,
                        'order_id' => null,
                    ];
                }

                // Chỉ dùng cột trên orders để tương thích giao dịch cũ.
                if (!$attempt && (
                    !$order->vnpay_txn_ref ||
                    !hash_equals((string) $order->vnpay_txn_ref, $txnRef)
                )) {
                    return [
                        'code' => '01',
                        'message' => 'Order not found',
                        'send_mail' => false,
                        'order_id' => null,
                    ];
                }

                $expectedAmount = (int) round(
                    (float) ($attempt?->amount ?? $order->total_amount) * 100
                );

                if ($expectedAmount !== (int) $receivedAmount) {
                    return [
                        'code' => '04',
                        'message' => 'Invalid amount',
                        'send_mail' => false,
                        'order_id' => $order->id,
                    ];
                }

                if (
                    $order->payment_status === 'paid' ||
                    $order->status === 'cancelled' ||
                    $attempt?->status === 'paid'
                ) {
                    return [
                        'code' => '02',
                        'message' => 'Order already confirmed',
                        'send_mail' => false,
                        'order_id' => $order->id,
                    ];
                }

                $responseCode = (string) (
                    $inputData['vnp_ResponseCode'] ?? ''
                );
                $transactionStatus = (string) (
                    $inputData['vnp_TransactionStatus'] ?? ''
                );

                $isSuccessful =
                    $responseCode === '00' &&
                    $transactionStatus === '00';

                $transactionNo =
                    $inputData['vnp_TransactionNo'] ?? null;
                $paidAt = $isSuccessful
                    ? $this->resolvePaidAt($inputData['vnp_PayDate'] ?? null)
                    : null;

                if ($attempt) {
                    $attempt->update([
                        'status' => $isSuccessful ? 'paid' : 'failed',
                        'response_code' => $responseCode ?: null,
                        'transaction_no' => $transactionNo,
                        'paid_at' => $paidAt,
                    ]);
                }

                if ($isSuccessful) {
                    $order->vnpayPaymentAttempts()
                        ->where('id', '!=', $attempt?->id ?? 0)
                        ->where('status', 'pending')
                        ->update(['status' => 'expired']);

                    $order->update([
                        'payment_status' => 'paid',
                        'vnpay_txn_ref' => $txnRef,
                        'vnpay_response_code' => $responseCode ?: null,
                        'vnpay_transaction_no' => $transactionNo,
                        'paid_at' => $paidAt,
                        'payment_expires_at' => null,
                    ]);
                } elseif (
                    !$attempt ||
                    hash_equals((string) $order->vnpay_txn_ref, $txnRef)
                ) {
                    // Không để IPN của attempt cũ làm hỏng attempt retry mới.
                    $order->update([
                        'payment_status' => 'failed',
                        'vnpay_response_code' => $responseCode ?: null,
                        'vnpay_transaction_no' => $transactionNo,
                        'paid_at' => null,
                    ]);
                }

                return [
                    'code' => '00',
                    'message' => 'Confirm Success',
                    'send_mail' => $isSuccessful,
                    'order_id' => $order->id,
                ];
            });

            if ($result['send_mail'] && $result['order_id']) {
                $this->sendPaymentSuccessEmail(
                    (int) $result['order_id']
                );
            }

            return $this->ipnResponse(
                $result['code'],
                $result['message']
            );
        } catch (\Throwable $exception) {
            Log::error('Lỗi xử lý VNPay IPN', [
                'message' => $exception->getMessage(),
                'ip' => $request->ip(),
            ]);

            return $this->ipnResponse(
                '99',
                'Unknown error'
            );
        }
    }

    /**
     * Lấy các tham số vnp_* từ request.
     */
    private function extractVnpayData(Request $request): array
    {
        $inputData = [];

        foreach ($request->all() as $key => $value) {
            if (
                str_starts_with((string) $key, 'vnp_') &&
                !is_array($value)
            ) {
                $inputData[(string) $key] = (string) $value;
            }
        }

        return $inputData;
    }

    /**
     * Kiểm tra chữ ký HMAC SHA-512 của dữ liệu VNPay trả về.
     */
    private function hasValidSignature(array $inputData): bool
    {
        $hashSecret = (string) config('vnpay.hash_secret', '');
        $tmnCode = (string) config('vnpay.tmn_code', '');
        $receivedHash = (string) (
            $inputData['vnp_SecureHash'] ?? ''
        );

        if (
            $hashSecret === '' ||
            $receivedHash === '' ||
            $tmnCode === '' ||
            (string) ($inputData['vnp_TmnCode'] ?? '') !== $tmnCode
        ) {
            return false;
        }

        unset(
            $inputData['vnp_SecureHash'],
            $inputData['vnp_SecureHashType']
        );

        $expectedHash = hash_hmac(
            'sha512',
            $this->buildHashData($inputData),
            $hashSecret
        );

        return hash_equals(
            strtolower($expectedHash),
            strtolower($receivedHash)
        );
    }

    /**
     * Sắp xếp và mã hóa query string dùng để ký dữ liệu VNPay.
     */
    private function buildHashData(array $inputData): string
    {
        ksort($inputData);

        $pairs = [];

        foreach ($inputData as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $pairs[] = urlencode((string) $key) .
                '=' .
                urlencode((string) $value);
        }

        return implode('&', $pairs);
    }

    /**
     * Đọc ID đơn hàng từ mã ORD{id}-yyyyMMddHHmmss-random.
     * Vẫn hỗ trợ mã cũ chỉ chứa ID để không làm hỏng giao dịch thử trước đó.
     */
    private function extractOrderId(string $txnRef): ?int
    {
        if (ctype_digit($txnRef)) {
            return (int) $txnRef;
        }

        if (preg_match('/^ORD([0-9]+)-/', $txnRef, $matches)) {
            return (int) $matches[1];
        }

        return null;
    }

    /**
     * Chuyển vnp_PayDate sang thời gian thanh toán của Laravel.
     */
    private function resolvePaidAt(?string $payDate): Carbon
    {
        if ($payDate) {
            try {
                return Carbon::createFromFormat(
                    'YmdHis',
                    $payDate,
                    self::VNPAY_TIMEZONE
                );
            } catch (\Throwable $exception) {
                Log::warning('vnp_PayDate không hợp lệ', [
                    'value' => $payDate,
                ]);
            }
        }

        return Carbon::now(self::VNPAY_TIMEZONE);
    }

    /**
     * Gửi email đúng một lần khi IPN chuyển đơn sang paid.
     */
    private function sendPaymentSuccessEmail(int $orderId): void
    {
        try {
            $order = Order::with([
                'user',
                'items.productVariant.product',
                'coupon',
                'address',
            ])->find($orderId);

            if (!$order || !$order->user?->email) {
                return;
            }

            Mail::to($order->user->email)->send(
                new OrderSuccessMail($order)
            );
        } catch (\Throwable $exception) {
            Log::error('Gửi email VNPay thành công thất bại', [
                'order_id' => $orderId,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * VNPay yêu cầu IPN luôn trả JSON gồm RspCode và Message.
     */
    private function ipnResponse(string $code, string $message)
    {
        return response()->json([
            'RspCode' => $code,
            'Message' => $message,
        ]);
    }
}
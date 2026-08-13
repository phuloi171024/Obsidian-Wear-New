<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Order; // Model Order của hệ thống

class VNPayController extends Controller
{
    /**
     * TẠO GIAO DỊCH THANH TOÁN
     * Gọi từ ReactJS (Cần có Sanctum Token)
     */
    public function createPayment(Request $request)
    {
        try {
            // Nhận dữ liệu từ request (Nên lấy thêm order_id từ DB dựa theo request để bảo mật số tiền)
            $amount = $request->input('amount'); 
            // Nếu có gửi order_id từ ReactJS thì dùng, không thì lấy thời gian thực làm mã giao dịch
            $vnp_TxnRef = $request->input('order_id', time()); 

            // Lấy cấu hình bảo mật từ file config/vnpay.php
            $vnp_TmnCode = config('vnpay.tmn_code');
            $vnp_HashSecret = config('vnpay.hash_secret');
            $vnp_Url = config('vnpay.url');
            $vnp_Returnurl = config('vnpay.return_url');

            // Khởi tạo mảng tham số gửi đi VNPay
            $inputData = [
                "vnp_Version" => "2.1.0",
                "vnp_TmnCode" => $vnp_TmnCode,
                "vnp_Amount" => $amount * 100, // VNPay yêu cầu nhân 100
                "vnp_Command" => "pay",
                "vnp_CreateDate" => date('YmdHis'),
                "vnp_CurrCode" => "VND",
                "vnp_IpAddr" => $request->ip(),
                "vnp_Locale" => "vn",
                "vnp_OrderInfo" => "Thanh toan don hang Obsidian Wear ma: " . $vnp_TxnRef,
                "vnp_OrderType" => "billpayment",
                "vnp_ReturnUrl" => $vnp_Returnurl,
                "vnp_TxnRef" => $vnp_TxnRef
            ];

            // Sắp xếp dữ liệu theo thứ tự Alphabet (Bắt buộc để tạo chữ ký đúng)
            ksort($inputData);
            $query = "";
            $i = 0;
            $hashdata = "";

            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashdata .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
                $query .= urlencode($key) . "=" . urlencode($value) . '&';
            }

            $vnp_Url = $vnp_Url . "?" . $query;

            // Mã hóa tạo chữ ký an toàn (SecureHash)
            if (isset($vnp_HashSecret)) {
                $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
                $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
            }

            // Trả URL về cho Frontend ReactJS chuyển hướng
            return response()->json([
                'success' => true,
                'message' => 'Tạo URL thanh toán thành công',
                'data' => $vnp_Url
            ]);

        } catch (\Exception $e) {
            Log::error('Lỗi API tạo thanh toán VNPay: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Hệ thống đang bận, vui lòng thử lại sau.'
            ], 500);
        }
    }

    /**
     * XỬ LÝ KẾT QUẢ TỪ VNPAY GỬI VỀ (RETURN URL)
     * VNPay gọi API này nên KHÔNG ĐƯỢC để trong middleware auth:sanctum
     */
    public function vnpayReturn(Request $request)
    {
        $vnp_HashSecret = config('vnpay.hash_secret');
        $inputData = [];
        
        // Chỉ bóc tách các tham số do VNPay gửi về
        foreach ($request->all() as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }

        // Lấy chữ ký do VNPay tạo để đối chiếu
        $vnp_SecureHash = $inputData['vnp_SecureHash'] ?? '';
        unset($inputData['vnp_SecureHash']);
        
        ksort($inputData);
        $i = 0;
        $hashData = "";

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData = $hashData . urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        // Tự tạo lại chữ ký bằng Hash Secret của hệ thống
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        // --- ĐƯỜNG DẪN TRANG WEB REACTJS CỦA BẠN ---
        // (Nếu code frontend chạy ở cổng khác thì bạn đổi lại chỗ này)
        $frontendUrl = 'http://localhost:3000'; 

        if ($secureHash === $vnp_SecureHash) {
            // ✅ Chữ ký hợp lệ (Dữ liệu không bị giả mạo)
            
            if ($request->vnp_ResponseCode == '00') {
                // 1. THANH TOÁN THÀNH CÔNG
                // Cập nhật trạng thái đơn hàng trong Database
                /*
                $order = Order::where('id', $request->vnp_TxnRef)->first();
                if ($order && $order->status !== 'paid') {
                    $order->status = 'paid';
                    $order->save();
                }
                */

                // Chuyển hướng người dùng về trang thông báo Thành công trên Frontend
                return redirect()->away($frontendUrl . '/checkout/success?order_id=' . $request->vnp_TxnRef);
            } else {
                // 2. THANH TOÁN THẤT BẠI (Do khách hủy, không đủ tiền, lỗi NH...)
                return redirect()->away($frontendUrl . '/checkout/failed?reason=' . $request->vnp_ResponseCode);
            }
        } else {
            // ❌ CHỮ KÝ KHÔNG HỢP LỆ
            Log::warning('Cảnh báo: Sai chữ ký VNPay Return từ IP - ' . $request->ip());
            return redirect()->away($frontendUrl . '/checkout/failed?reason=invalid_signature');
        }
    }
}
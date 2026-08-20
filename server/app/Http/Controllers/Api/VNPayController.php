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
        $frontendUrl = 'http://localhost:5173'; 

        if ($secureHash === $vnp_SecureHash) {
            // ✅ Chữ ký hợp lệ (Dữ liệu không bị giả mạo)
            
            if ($request->vnp_ResponseCode == '00') {
                // Chuyển hướng người dùng về trang thông báo Thành công trên Frontend
                return redirect()->away($frontendUrl . '/checkout/success?order_id=' . $request->vnp_TxnRef);
            } else {
                // THANH TOÁN THẤT BẠI (Do khách hủy, không đủ tiền, lỗi NH...)
                return redirect()->away($frontendUrl . '/checkout/failed?reason=' . $request->vnp_ResponseCode);
            }
        } else {
            // ❌ CHỮ KÝ KHÔNG HỢP LỆ
            Log::warning('Cảnh báo: Sai chữ ký VNPay Return từ IP - ' . $request->ip());
            return redirect()->away($frontendUrl . '/checkout/failed?reason=invalid_signature');
        }
    }

    /**
     * XỬ LÝ KẾT QUẢ TỪ VNPAY GỬI VỀ (IPN)
     * VNPay gọi ngầm để Server-to-Server chốt cập nhật DB
     */
    public function vnpayIpn(Request $request)
    {
        // 1. Lấy Secret Key từ file cấu hình
        $vnp_HashSecret = config('vnpay.hash_secret'); 
        
        $inputData = array();
        $returnData = array();
        
        // 2. Lấy toàn bộ tham số VNPay trả về
        foreach ($request->all() as $key => $value) {
            if (substr($key, 0, 4) == "vnp_") {
                $inputData[$key] = $value;
            }
        }
        
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
        
        // Tạo lại chữ ký để so sánh
        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);
        
        // Lấy thông tin ID đơn hàng và Số tiền
        $vnpTranId = $inputData['vnp_TxnRef'] ?? null; 
        $vnp_Amount = isset($inputData['vnp_Amount']) ? $inputData['vnp_Amount'] / 100 : 0; // VNPay luôn nhân 100 số tiền
        
        try {
            // VÒNG 1: Kiểm tra chữ ký
            if ($secureHash === $vnp_SecureHash) {
                $order = Order::find($vnpTranId);
                
                // VÒNG 2: Kiểm tra đơn hàng có tồn tại
                if ($order != NULL) {
                    
                    // VÒNG 3: Kiểm tra số tiền có khớp không
                    if ($order->total_amount == $vnp_Amount) {
                        
                        // VÒNG 4: Kiểm tra trạng thái đơn hàng (Chỉ xử lý nếu đang chờ)
                        if ($order->status == 'pending') {
                            
                            // VÒNG 5: KIỂM TRA MÃ KẾT QUẢ TỪ VNPAY
                            if ($inputData['vnp_ResponseCode'] == '00' || $inputData['vnp_TransactionStatus'] == '00') {
                                
                                // ==========================================
                                // FIX AC63: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG Ở ĐÂY
                                // ==========================================
                                // Tùy vào nghiệp vụ, đẩy status lên 'shipped' (Chuẩn bị giao)
                                $order->status = 'shipped'; 
                                $order->save();
                                
                                $returnData['RspCode'] = '00';
                                $returnData['Message'] = 'Confirm Success';
                            } else {
                                // Giao dịch thất bại (Khách hủy hoặc thẻ lỗi)
                                $order->status = 'cancelled';
                                $order->save();
                                
                                $returnData['RspCode'] = '00';
                                $returnData['Message'] = 'Confirm Success';
                            }
                        } else {
                            // Báo cho VNPay biết đơn hàng đã được cập nhật trước đó rồi
                            $returnData['RspCode'] = '02';
                            $returnData['Message'] = 'Order already confirmed';
                        }
                    } else {
                        // Báo cho VNPay biết số tiền bị lệch (nghi ngờ hack)
                        $returnData['RspCode'] = '04';
                        $returnData['Message'] = 'Invalid amount';
                    }
                } else {
                    // Báo cho VNPay biết không tìm thấy mã đơn hàng
                    $returnData['RspCode'] = '01';
                    $returnData['Message'] = 'Order not found';
                }
            } else {
                // Chữ ký sai -> Từ chối cập nhật
                $returnData['RspCode'] = '97';
                $returnData['Message'] = 'Invalid signature';
            }
        } catch (\Exception $e) {
            // Lỗi hệ thống bất ngờ
            Log::error('VNPay IPN Error: ' . $e->getMessage());
            $returnData['RspCode'] = '99';
            $returnData['Message'] = 'Unknown error';
        }
        
        // Bắt buộc phải trả về JSON đúng chuẩn để VNPay Server đọc được
        return response()->json($returnData);
    }
}
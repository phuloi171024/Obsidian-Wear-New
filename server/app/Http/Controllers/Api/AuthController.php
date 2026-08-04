<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Mail\Message;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * 1. Đăng ký tài khoản mới
     */
    public function register(Request $request) 
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'phone'    => 'nullable|string|max:15|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone ?? null,
            'password' => Hash::make($request->password),
            'role'     => 'user',
            'status'   => true,
        ]);

        // Tạo token đăng nhập ngay sau khi đăng ký
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'       => true,
            'message'      => 'Đăng ký tài khoản thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'data'         => $user
        ], 201);
    }

    /**
     * 2. Đăng nhập hệ thống
     */
    public function login(Request $request) 
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        // Kiểm tra tài khoản và mật khẩu
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => false,
                'message' => 'Email hoặc mật khẩu không chính xác!'
            ], 401);
        }

        // Kiểm tra xem tài khoản có bị khóa không
        if (!$user->status) {
            return response()->json([
                'status'  => false,
                'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin!'
            ], 403);
        }

        // Tạo Sanctum Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status'       => true,
            'message'      => 'Đăng nhập thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'data'         => $user
        ], 200);
    }

    /**
     * 3. Đăng xuất hệ thống (Thu hồi Token)
     */
    public function logout(Request $request) 
    {
        // Xóa token hiện tại của user
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Đăng xuất thành công!'
        ], 200);
    }

    /**
     * 4. Gửi liên kết khôi phục mật khẩu qua Email (Quên mật khẩu)
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'Email này chưa được đăng ký trong hệ thống!'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        // Tạo ngẫu nhiên 1 chuỗi Token
        $token = Str::random(60);

        // Lưu vào bảng password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token'      => Hash::make($token),
                'created_at' => now()
            ]
        );

        // Đường dẫn trả về cho trang Reset Password bên Frontend (ReactJS)
        $resetLink = "http://localhost:5173/reset-password?token=" . $token . "&email=" . urlencode($request->email);

        // Gửi Mail
        try {
            Mail::raw("Chào bạn,\n\nBạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Obsidian Wear.\nVui lòng bấm vào liên kết dưới đây để tạo mật khẩu mới:\n" . $resetLink . "\n\nNếu bạn không yêu cầu, vui lòng bỏ qua email này.", function (Message $message) use ($request) {
                $message->to($request->email);
                $message->subject('Khôi phục mật khẩu tài khoản Obsidian Wear');
            });

            return response()->json([
                'status'  => true,
                'message' => 'Đã gửi liên kết khôi phục mật khẩu về email của bạn. Vui lòng kiểm tra hộp thư!'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Không thể gửi email lúc này. Vui lòng kiểm tra lại cấu hình SMTP trong file .env!'
            ], 500);
        }
    }

    /**
     * 5. Đặt lại mật khẩu mới
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'                 => 'required|email|exists:users,email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed', // Yêu cầu field: password_confirmation
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 400);
        }

        $resetRecord = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        // Kiểm tra Token có hợp lệ không
        if (!$resetRecord || !Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'status'  => false,
                'message' => 'Mã liên kết xác nhận không hợp lệ hoặc đã hết hạn!'
            ], 400);
        }

        // Cập nhật mật khẩu mới vào bảng users
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // Xóa token khôi phục sau khi đổi mật khẩu thành công
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại bằng mật khẩu mới.'
        ], 200);
    }

    /**
     * 6. Lấy URL chuyển hướng đến trang Đăng nhập Google
     */
    public function redirectToGoogle()
    {
        // Chế độ stateless() bắt buộc dành cho API (không dùng session)
        $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
        
        return response()->json([
            'status' => true,
            'url'    => $url
        ], 200);
    }

    /**
     * 7. Xử lý dữ liệu Google trả về và cấp Token
     */
    public function handleGoogleCallback()
    {
        try {
            // Lấy thông tin user từ Google
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Kiểm tra xem email này đã tồn tại trong DB chưa
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // Nếu chưa có, tạo tài khoản mới tự động
                $user = User::create([
                    'name'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'password'  => null,
                    'role'      => 'user',
                    'status'    => true,
                ]);
            } else {
                // Nếu đã có tài khoản (đăng ký bằng form trước đó), chỉ cần cập nhật google_id
                $user->update(['google_id' => $googleUser->getId()]);
            }

            // Tạo Token đăng nhập Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // Chuyển hướng thẳng về trang Frontend (React) kèm theo Token trên thanh địa chỉ
            return redirect()->away('http://localhost:5173/login?token=' . $token);

        } catch (\Exception $e) {
            // Nếu có lỗi (người dùng hủy đăng nhập), trả về trang login kèm lỗi
            return redirect()->away('http://localhost:5173/login?error=google_auth_failed');
        }
    }
}
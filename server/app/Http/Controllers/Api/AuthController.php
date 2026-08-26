<?php

namespace App\Http\Controllers\Api;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
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
use Illuminate\Support\Facades\Log;
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
        ],
        [
          
            'email.unique'      => 'Địa chỉ email này đã được đăng ký.',
            'email.required'    => 'Vui lòng nhập địa chỉ email.',
            'email.email'       => 'Định dạng email không hợp lệ.',
            'phone.unique'      => 'Số điện thoại này đã được sử dụng.',
            'name.required'     => 'Vui lòng nhập họ và tên.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min'      => 'Mật khẩu phải có ít nhất 8 ký tự.'
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
       if (!$user || !$user->password || !Hash::check($request->password, $user->password)) {
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

    public function adminLogin(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()
            ->where('email', mb_strtolower(trim($validated['email'])))
            ->first();

        if (
            !$user ||
            !$user->password ||
            !Hash::check($validated['password'], $user->password) ||
            $user->role !== 'admin'
        ) {
            return response()->json([
                'status' => false,
                'message' => 'Thông tin đăng nhập quản trị không chính xác!',
            ], 401);
        }

        if (!$user->status) {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản quản trị đã bị khóa!',
            ], 403);
        }

        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Đăng nhập quản trị thành công!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'data' => $user,
        ]);
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
        'email' => [
            'required',
            'string',
            'email',
            'max:255',
        ],
    ], [
        'email.required' => 'Vui lòng nhập địa chỉ email.',
        'email.email' => 'Định dạng email không hợp lệ.',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => false,
            'errors' => $validator->errors(),
        ], 422);
    }

    $genericMessage =
        'Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.';

    $email = mb_strtolower(trim($request->input('email')));

    $user = User::query()
        ->where('email', $email)
        ->first();

    /*
     * Luôn trả cùng một kết quả nếu email không tồn tại hoặc
     * tài khoản đã bị khóa để tránh bị dò email người dùng.
     */
    if (!$user || !$user->status) {
        return response()->json([
            'status' => true,
            'message' => $genericMessage,
        ]);
    }

    $token = Str::random(60);

    DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $user->email],
        [
            'token' => Hash::make($token),
            'created_at' => now(),
        ]
    );

    $frontendUrl = rtrim(
        (string) config(
            'app.frontend_url',
            'http://localhost:5173'
        ),
        '/'
    );

    $query = http_build_query(
        [
            'token' => $token,
            'email' => $user->email,
        ],
        '',
        '&',
        PHP_QUERY_RFC3986
    );

    $resetLink = "{$frontendUrl}/reset-password?{$query}";

    try {
        Mail::raw(
            "Chào bạn,\n\n" .
            "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Obsidian Wear.\n" .
            "Vui lòng bấm vào liên kết dưới đây để tạo mật khẩu mới:\n\n" .
            $resetLink . "\n\n" .
            "Liên kết có hiệu lực trong 60 phút.\n\n" .
            "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.",
            function (Message $message) use ($user) {
                $message->to($user->email);
                $message->subject(
                    'Khôi phục mật khẩu tài khoản Obsidian Wear'
                );
            }
        );
    } catch (\Throwable $exception) {
        /*
         * Ghi lỗi nội bộ nhưng vẫn trả thông báo chung.
         * Không cho người ngoài biết email có tồn tại hay không.
         */
        Log::error('Gửi email đặt lại mật khẩu thất bại', [
            'user_id' => $user->id,
            'message' => $exception->getMessage(),
        ]);
    }

    return response()->json([
        'status' => true,
        'message' => $genericMessage,
    ]);
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
       $isExpired = !$resetRecord
    || !$resetRecord->created_at
    || Carbon::parse($resetRecord->created_at)
        ->addMinutes(60)
        ->isPast();

if (
    $isExpired
    || !Hash::check($request->token, $resetRecord->token)
) {
    // Xóa token đã hết hạn khỏi database
    if ($resetRecord && $isExpired) {
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();
    }

    return response()->json([
        'status' => false,
        'message' => 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!'
    ], 400);
}

        $user = User::where('email', $request->email)->first();

$user->password = Hash::make($request->password);
$user->save();

// Thu hồi toàn bộ Sanctum token cũ
$user->tokens()->delete();

// Token reset chỉ được dùng một lần
DB::table('password_reset_tokens')
    ->where('email', $request->email)
    ->delete();

return response()->json([
    'status' => true,
    'message' => 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.'
], 200);
    }

    /**
     * 6. Chuyển hướng trực tiếp đến trang Đăng nhập Google
     */
  public function redirectToGoogle()
{
    // State ngẫu nhiên dùng để chống login CSRF.
    $state = Str::random(64);

    Cache::put(
        'google_oauth_state:' . hash('sha256', $state),
        true,
        now()->addMinutes(10)
    );

    /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
    $provider = Socialite::driver('google');

    $url = $provider
        ->stateless()
        ->with([
            'prompt' => 'select_account',
            'state' => $state,
        ])
        ->redirect()
        ->getTargetUrl();

    /*
     * Cookie HttpOnly liên kết state với đúng trình duyệt
     * đã bắt đầu đăng nhập Google.
     */
    return response()
        ->json([
            'status' => true,
            'url' => $url,
        ])
        ->cookie(
            'google_oauth_state',
            $state,
            10,
            '/',
            null,
            app()->environment('production'),
            true,
            false,
            'lax'
        );
}
    /**
     * 7. Xử lý dữ liệu Google trả về và cấp Token
     */
public function handleGoogleCallback(Request $request)
{
    $frontendUrl = rtrim(
        (string) config(
            'app.frontend_url',
            'http://localhost:5173'
        ),
        '/'
    );

    $returnedState = $request->query('state');
    $cookieState = $request->cookie('google_oauth_state');

    $stateIsValid =
        is_string($returnedState) &&
        is_string($cookieState) &&
        strlen($returnedState) === 64 &&
        strlen($cookieState) === 64 &&
        hash_equals($cookieState, $returnedState);

    if (!$stateIsValid) {
        return redirect()
            ->away(
                $frontendUrl .
                '/login?error=invalid_oauth_state'
            )
            ->withoutCookie('google_oauth_state');
    }

    $stateCacheKey = 'google_oauth_state:' .
        hash('sha256', $returnedState);

    // pull() khiến state chỉ sử dụng được một lần.
    if (!Cache::pull($stateCacheKey)) {
        return redirect()
            ->away(
                $frontendUrl .
                '/login?error=invalid_oauth_state'
            )
            ->withoutCookie('google_oauth_state');
    }

    try {
        /** @var \Laravel\Socialite\Two\GoogleProvider $provider */
        $provider = Socialite::driver('google');

        $googleUser = $provider
            ->stateless()
            ->user();

        $user = User::query()
            ->where('email', $googleUser->getEmail())
            ->first();

        $isNewUser = !$user;

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => null,
                'role' => 'user',
                'status' => true,
            ]);
        } else {
            if (!$user->status) {
                return redirect()
                    ->away(
                        $frontendUrl .
                        '/login?error=account_disabled'
                    )
                    ->withoutCookie('google_oauth_state');
            }

            /*
             * Không cho một Google ID liên kết nhầm với
             * tài khoản đang có Google ID khác.
             */
            if (
                $user->google_id &&
                $user->google_id !== $googleUser->getId()
            ) {
                return redirect()
                    ->away(
                        $frontendUrl .
                        '/login?error=google_account_mismatch'
                    )
                    ->withoutCookie('google_oauth_state');
            }

            if (!$user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                ]);
            }
        }

        // Chỉ đưa mã trao đổi dùng một lần lên URL.
        $exchangeCode = Str::random(64);

        $exchangeCacheKey = 'google_exchange:' .
            hash('sha256', $exchangeCode);

        Cache::put(
            $exchangeCacheKey,
            [
                'user_id' => $user->id,
                'is_new_user' => $isNewUser,
            ],
            now()->addMinutes(2)
        );

        return redirect()
            ->away(
                $frontendUrl .
                '/login?google_code=' .
                urlencode($exchangeCode)
            )
            ->withoutCookie('google_oauth_state');
    } catch (\Throwable $exception) {
        Log::error('Google OAuth Error', [
            'message' => $exception->getMessage(),
        ]);

        return redirect()
            ->away(
                $frontendUrl .
                '/login?error=google_login_failed'
            )
            ->withoutCookie('google_oauth_state');
    }
}
public function exchangeGoogleCode(Request $request)
{
    $validated = $request->validate([
        'code' => 'required|string|size:64',
    ]);

    $cacheKey = 'google_exchange:'
        . hash('sha256', $validated['code']);

    // pull: lấy dữ liệu và xóa ngay, mã không dùng lần hai được
    $payload = Cache::pull($cacheKey);

    if (!$payload) {
        return response()->json([
            'status' => false,
            'message' => 'Mã xác thực Google không hợp lệ hoặc đã hết hạn!'
        ], 422);
    }

    $user = User::find($payload['user_id']);

    if (!$user || !$user->status) {
        return response()->json([
            'status' => false,
            'message' => 'Tài khoản không tồn tại hoặc đã bị khóa!'
        ], 403);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    $isNewUser = (bool) ($payload['is_new_user'] ?? false);

    return response()->json([
        'status'       => true,
        'message'      => $isNewUser
            ? 'Đăng ký bằng Google thành công!'
            : 'Đăng nhập Google thành công!',
        'access_token' => $token,
        'token_type'   => 'Bearer',
        'is_new_user'  => $isNewUser,
        'data'         => $user,
    ]);
}
}

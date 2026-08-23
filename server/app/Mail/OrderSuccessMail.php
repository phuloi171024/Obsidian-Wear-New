<?php

namespace App\Mail;

use App\Models\Order; // THÊM DÒNG NÀY ĐỂ NHẬN DIỆN MODEL ORDER
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    // Sửa lại chỗ này: Bỏ chữ int, thay bằng Order
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject('Xác nhận đặt hàng thành công tại Obsidian Wear')
                    ->view('emails.order_success'); 
    }
}
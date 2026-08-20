<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public int $order;

    // Nhận thông tin đơn hàng truyền vào
    public function __construct( int $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        return $this->subject('Xác nhận đặt hàng thành công tại Obsidian Wear')
                    ->view('emails.order_success'); // Trỏ tới file giao diện email ở bước 3
    }
}
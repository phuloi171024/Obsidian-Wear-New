<?php

return [
    // Đơn COD chờ quá thời gian này sẽ tự hủy để hoàn kho và trả voucher.
    'cod_reservation_minutes' => max(5, (int) env('COD_RESERVATION_MINUTES', 1440)),
];

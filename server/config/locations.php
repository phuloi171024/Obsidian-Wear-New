<?php

return [
    'base_url' => env('VIETNAM_LOCATION_API_URL', 'https://provinces.open-api.vn/api/v2'),
    'cache_seconds' => (int) env('VIETNAM_LOCATION_CACHE_SECONDS', 86400),
    'timeout_seconds' => (int) env('VIETNAM_LOCATION_TIMEOUT_SECONDS', 8),
];

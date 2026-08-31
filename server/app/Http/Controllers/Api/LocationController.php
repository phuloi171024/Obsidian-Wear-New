<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function __construct(private readonly LocationService $locations) {}

    public function provinces(): JsonResponse
    {
        return response()->json(['status' => true, 'data' => $this->locations->provinces()]);
    }

    public function wards(string $provinceCode): JsonResponse
    {
        return response()->json(['status' => true, 'data' => $this->locations->wards($provinceCode)]);
    }
}

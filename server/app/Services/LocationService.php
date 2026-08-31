<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class LocationService
{
    public function provinces(): array
    {
        return Cache::remember('vn_locations_v2_provinces', config('locations.cache_seconds'), function () {
            $data = $this->get('/p/');
            return collect($data)->map(fn ($item) => [
                'code' => (string) ($item['code'] ?? ''),
                'name' => $item['name'] ?? '',
            ])->filter(fn ($item) => $item['code'] && $item['name'])->values()->all();
        });
    }

    public function wards(string $provinceCode): array
    {
        return Cache::remember('vn_locations_v2_wards_'.$provinceCode, config('locations.cache_seconds'), function () use ($provinceCode) {
            $data = $this->get('/w/', ['province' => $provinceCode]);
            if (isset($data['wards'])) $data = $data['wards'];
            return collect($data)->map(fn ($item) => [
                'code' => (string) ($item['code'] ?? ''),
                'name' => $item['name'] ?? '',
                'province_code' => (string) ($item['province_code'] ?? $provinceCode),
            ])->filter(fn ($item) => $item['code'] && $item['name'])->values()->all();
        });
    }

    private function get(string $path, array $query = []): array
    {
        $response = Http::timeout(config('locations.timeout_seconds'))
            ->retry(2, 250)
            ->get(rtrim(config('locations.base_url'), '/').$path, $query);
        if (!$response->successful() || !is_array($response->json())) {
            throw new RuntimeException('Không thể tải dữ liệu tỉnh/phường lúc này.');
        }
        return $response->json();
    }
}

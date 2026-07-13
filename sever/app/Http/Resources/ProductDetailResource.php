<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'slug'        => $this->slug,
            'price'       => (float) $this->price,
            'description' => $this->description,
            'stock'       => $this->stock_quantity,
            
            // Xử lý thông tin danh mục
            'category' => [
                'id'   => $this->category->id ?? null,
                'name' => $this->category->name ?? 'Chưa phân loại',
            ],

            // Xử lý thông tin thương hiệu
            'brand' => [
                'id'   => $this->brand->id ?? null,
                'name' => $this->brand->name ?? 'Chưa rõ thương hiệu',
            ],

            // Các biến thể (size, color, v.v...)
            'variants' => $this->variants,

            // Chỉ lấy danh sách đường dẫn ảnh
            'images' => $this->images->map(function ($image) {
                return $image->image_url; // Đảm bảo thuộc tính này khớp với model ProductImage của em
            }),

            // Xử lý danh sách đánh giá (kèm thông tin người đánh giá)
            'reviews' => $this->reviews->map(function ($review) {
                return [
                    'id'      => $review->id,
                    'rating'  => $review->rating,
                    'comment' => $review->comment,
                    'user'    => [
                        'name' => $review->user->name ?? 'Người dùng ẩn danh',
                    ],
                    'created_at' => $review->created_at->format('d/m/Y'),
                ];
            }),
        ];
    }
}
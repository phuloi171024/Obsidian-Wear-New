<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'name'  => $this->name,
            'slug'  => $this->slug,
            'price' => (float) $this->price,
            
            // Chỉ lấy tên danh mục để hiển thị trên thẻ sản phẩm
            'category_name' => $this->category->name ?? 'Chưa phân loại',
            
            // Chỉ lấy ảnh đầu tiên làm ảnh đại diện (thumbnail)
            'thumbnail' => $this->images->first()->image_url ?? 'default-image.jpg',
            
            // Thêm các thông tin phụ nếu cần thiết (ví dụ: đang giảm giá hay không)
            'has_variants' => $this->variants->count() > 0,
        ];
    }
}
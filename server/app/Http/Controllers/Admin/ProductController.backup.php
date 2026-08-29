<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Chuẩn hóa tên màu để Trắng, trắng, " Trắng " không bị xem là
     * các màu khác nhau trên giao diện.
     */
    private function normalizeVariantColor(mixed $value): string
    {
        $color = trim((string) $value);
        $color = preg_replace('/\s+/u', ' ', $color) ?? $color;

        if (class_exists(\Normalizer::class)) {
            $color = \Normalizer::normalize(
                $color,
                \Normalizer::FORM_C
            ) ?: $color;
        }

        return mb_convert_case($color, MB_CASE_TITLE, 'UTF-8');
    }

    private function normalizeVariantSize(mixed $value): string
    {
        $size = trim((string) $value);
        $size = preg_replace('/\s+/u', ' ', $size) ?? $size;

        return mb_strtoupper($size, 'UTF-8');
    }

    private function variantColorKey(mixed $value): string
    {
        return mb_strtolower(
            $this->normalizeVariantColor($value),
            'UTF-8'
        );
    }

    private function normalizeVariantsInput(Request $request): void
    {
        if (!is_array($request->input('variants'))) {
            return;
        }

        $variants = collect($request->input('variants'))
            ->map(function ($variant) {
                if (!is_array($variant)) {
                    return $variant;
                }

                return [
                    ...$variant,
                    'color' => $this->normalizeVariantColor(
                        $variant['color'] ?? ''
                    ),
                    'size' => $this->normalizeVariantSize(
                        $variant['size'] ?? ''
                    ),
                ];
            })
            ->values()
            ->all();

        $request->merge(['variants' => $variants]);
    }

    /**
     * Danh sách sản phẩm cho Admin.
     */
    public function index(Request $request)
    {
        $query = Product::with([
            'category',
            'brand',
            'variants',
            'images',
        ]);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('brand_id')) {
            $query->where('brand_id', $request->input('brand_id'));
        }

        if ($request->filled('status')) {
            $status = filter_var(
                $request->input('status'),
                FILTER_VALIDATE_BOOLEAN,
                FILTER_NULL_ON_FAILURE
            );

            if ($status !== null) {
                $query->where('status', $status);
            }
        }

        $perPage = max(
            1,
            min((int) $request->input('per_page', 15), 500)
        );

        return response()->json(
            $query->latest()->paginate($perPage)
        );
    }

    /**
     * Tạo sản phẩm và các biến thể trong cùng transaction.
     */
    public function store(Request $request)
    {
        $this->normalizeVariantsInput($request);

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'price' => ['required', 'numeric', 'min:0'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'lt:price'],
            'deal_label' => ['nullable', 'string', 'max:255'],
            'sale_starts_at' => ['nullable', 'date'],
            'sale_ends_at' => ['nullable', 'date', 'after_or_equal:sale_starts_at'],
            'description' => ['nullable', 'string'],
            'status' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'sport_type' => [
                'nullable',
                Rule::in([
                    'tennis-pickleball',
                    'running',
                    'swimming',
                    'football',
                    'gym',
                ]),
            ],
            'thumbnail' => ['nullable', 'string', 'max:2048'],
            'sku' => ['nullable', 'string', 'max:255', 'unique:products,sku'],
            'variants' => ['nullable', 'array'],
            'variants.*.size' => [
                'required_with:variants',
                'string',
                'max:255',
            ],
            'variants.*.color' => [
                'required_with:variants',
                'string',
                'max:255',
            ],
            'variants.*.stock' => [
                'required_with:variants',
                'integer',
                'min:0',
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu sản phẩm không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();
        $variantKeys = [];

        foreach ($validated['variants'] ?? [] as $index => $variant) {
            $key = $this->variantColorKey($variant['color'])
                .'|'.$this->normalizeVariantSize($variant['size']);

            if (isset($variantKeys[$key])) {
                return response()->json([
                    'status' => false,
                    'message' => 'Biến thể bị trùng màu và size.',
                    'errors' => [
                        "variants.{$index}" => [
                            'Tổ hợp màu và size này đã xuất hiện trong danh sách.',
                        ],
                    ],
                ], 422);
            }

            $variantKeys[$key] = true;
        }

        $product = DB::transaction(function () use ($request, $validated) {
            $product = new Product();
            $product->forceFill([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']).'-'.Str::lower(Str::random(6)),
                'sku' => $validated['sku'] ?? strtoupper(Str::random(8)),
                'category_id' => $validated['category_id'],
                'brand_id' => $validated['brand_id'] ?? null,
                'price' => $validated['price'],
                'sale_price' => $validated['sale_price'] ?? null,
                'deal_label' => $validated['deal_label'] ?? null,
                'sale_starts_at' => $validated['sale_starts_at'] ?? null,
                'sale_ends_at' => $validated['sale_ends_at'] ?? null,
                'description' => $validated['description'] ?? null,
                'thumbnail' => $validated['thumbnail'] ?? null,
                'status' => $request->has('status')
                    ? $request->boolean('status')
                    : true,
                'is_featured' => $request->boolean('is_featured'),
                'sport_type' => $validated['sport_type'] ?? null,
            ]);
            $product->save();

            foreach ($validated['variants'] ?? [] as $variant) {
                $product->variants()->create([
                    'size' => $this->normalizeVariantSize($variant['size']),
                    'color' => $this->normalizeVariantColor($variant['color']),
                    'stock' => $variant['stock'],
                ]);
            }

            return $product;
        });

        return response()->json([
            'status' => true,
            'message' => 'Tạo sản phẩm thành công!',
            'product' => $product->load([
                'category',
                'brand',
                'variants',
                'images',
            ]),
        ], 201);
    }

    public function show(int $id)
    {
        $product = Product::with([
            'category',
            'brand',
            'variants',
            'images',
            'reviews.user',
        ])->findOrFail($id);

        return response()->json([
            'status' => true,
            'product' => $product,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => ['sometimes', 'string', 'max:255'],
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'brand_id' => ['sometimes', 'nullable', 'integer', 'exists:brands,id'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'sale_price' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'deal_label' => ['sometimes', 'nullable', 'string', 'max:255'],
            'sale_starts_at' => ['sometimes', 'nullable', 'date'],
            'sale_ends_at' => ['sometimes', 'nullable', 'date'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'sport_type' => [
                'sometimes',
                'nullable',
                Rule::in([
                    'tennis-pickleball',
                    'running',
                    'swimming',
                    'football',
                    'gym',
                ]),
            ],
            'thumbnail' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'sku' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($product->id),
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu sản phẩm không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if (array_key_exists('name', $data) && $data['name'] !== $product->name) {
            $data['slug'] = Str::slug($data['name']).'-'.Str::lower(Str::random(6));
        }

        if (array_key_exists('status', $data)) {
            $data['status'] = $request->boolean('status');
        }

        if (array_key_exists('is_featured', $data)) {
            $data['is_featured'] = $request->boolean('is_featured');
        }

        $product->forceFill($data);
        $product->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật sản phẩm thành công!',
            'product' => $product->fresh()->load([
                'category',
                'brand',
                'variants',
                'images',
            ]),
        ]);
    }

    public function destroy(int $id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa sản phẩm thành công!',
        ]);
    }

    /**
     * Upload tối đa 8 ảnh gallery cho mỗi sản phẩm.
     */
    public function uploadImages(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'images' => ['required', 'array', 'min:1', 'max:8'],
            'images.*' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],
        ], [
            'images.required' => 'Vui lòng chọn ít nhất một ảnh.',
            'images.max' => 'Mỗi lần chỉ được chọn tối đa 8 ảnh.',
            'images.*.image' => 'Tệp được chọn phải là hình ảnh.',
            'images.*.mimes' => 'Ảnh phải có định dạng JPEG, JPG, PNG hoặc WEBP.',
            'images.*.max' => 'Mỗi ảnh không được vượt quá 5MB.',
        ]);

        $files = $request->file('images', []);
        $currentImageCount = $product->images()->count();

        if ($currentImageCount + count($files) > 8) {
            $remaining = max(0, 8 - $currentImageCount);

            return response()->json([
                'status' => false,
                'message' => "Sản phẩm đã có {$currentImageCount} ảnh. "
                    ."Bạn chỉ có thể thêm tối đa {$remaining} ảnh nữa.",
            ], 422);
        }

        try {
            $createdImages = [];

            foreach ($files as $file) {
                $url = Cloudinary::upload(
                    $file->getRealPath(),
                    ['folder' => 'obsidian_wear/products/gallery']
                )->getSecurePath();

                $createdImages[] = $product->images()->create([
                    'image_path' => $url,
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Thêm ảnh gallery thành công!',
                'images' => $product->fresh()->load('images')->images,
                'uploaded_images' => $createdImages,
            ], 201);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi tải ảnh lên Cloudinary!',
            ], 500);
        }
    }

    public function deleteImage(int $id, int $imageId)
    {
        $product = Product::findOrFail($id);
        $image = $product->images()->whereKey($imageId)->firstOrFail();
        $image->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa ảnh gallery!',
        ]);
    }

    public function addVariant(Request $request, int $id)
    {
        $product = Product::findOrFail($id);

        $request->merge([
            'color' => $this->normalizeVariantColor($request->input('color')),
            'size' => $this->normalizeVariantSize($request->input('size')),
        ]);

        $validated = $request->validate([
            'color' => ['required', 'string', 'max:255'],
            'size' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_variants', 'size')
                    ->where(function ($query) use ($id, $request) {
                        return $query
                            ->where('product_id', $id)
                            ->where('color', $request->input('color'))
                            ->whereNull('deleted_at');
                    }),
            ],
            'stock' => ['required', 'integer', 'min:0'],
        ], [
            'size.unique' => 'Sản phẩm đã có biến thể với màu và size này.',
        ]);

        try {
            $variant = $product->variants()->create($validated);
        } catch (QueryException $exception) {
            if (in_array((string) $exception->getCode(), ['23000', '23505'], true)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm đã có biến thể với màu và size này.',
                ], 422);
            }

            throw $exception;
        }

        return response()->json([
            'status' => true,
            'message' => 'Thêm biến thể thành công!',
            'variant' => $variant,
        ], 201);
    }

    public function updateVariant(
        Request $request,
        int $id,
        int $variantId
    ) {
        $variant = ProductVariant::where('product_id', $id)
            ->findOrFail($variantId);

        $color = $request->has('color')
            ? $this->normalizeVariantColor($request->input('color'))
            : $variant->color;

        $size = $request->has('size')
            ? $this->normalizeVariantSize($request->input('size'))
            : $variant->size;

        $request->merge([
            'color' => $color,
            'size' => $size,
            'stock' => $request->input('stock', $variant->stock),
        ]);

        $validated = $request->validate([
            'color' => ['required', 'string', 'max:255'],
            'size' => [
                'required',
                'string',
                'max:255',
                Rule::unique('product_variants', 'size')
                    ->ignore($variant->id)
                    ->where(function ($query) use ($id, $request) {
                        return $query
                            ->where('product_id', $id)
                            ->where('color', $request->input('color'))
                            ->whereNull('deleted_at');
                    }),
            ],
            'stock' => ['required', 'integer', 'min:0'],
        ], [
            'size.unique' => 'Sản phẩm đã có biến thể với màu và size này.',
        ]);

        try {
            $variant->update($validated);
        } catch (QueryException $exception) {
            if (in_array((string) $exception->getCode(), ['23000', '23505'], true)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm đã có biến thể với màu và size này.',
                ], 422);
            }

            throw $exception;
        }

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật biến thể thành công!',
            'variant' => $variant->fresh(),
        ]);
    }

    public function deleteVariant(int $id, int $variantId)
    {
        $variant = ProductVariant::where('product_id', $id)
            ->findOrFail($variantId);

        $variant->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa biến thể!',
        ]);
    }

    public function updateImage(Request $request, int $id)
{
    $product = Product::find($id);

    if (!$product) {
        return response()->json([
            'status' => false,
            'message' => 'Không tìm thấy sản phẩm!',
        ], 404);
    }

    $validated = $request->validate([
        'image_file' => [
            'required',
            'image',
            'mimes:jpeg,jpg,png,webp',
            'max:5120',
        ],
    ], [
        'image_file.required' => 'Vui lòng chọn ảnh.',
        'image_file.image' => 'Tệp được chọn phải là hình ảnh.',
        'image_file.mimes' => 'Ảnh phải có định dạng JPEG, JPG, PNG hoặc WEBP.',
        'image_file.max' => 'Ảnh không được vượt quá 5MB.',
    ]);

    try {
        $file = $request->file('image_file');

        $uploadResult = cloudinary()
            ->uploadApi()
            ->upload($file->getRealPath(), [
                'folder' => 'obsidian_wear/products',
                'resource_type' => 'image',
            ]);

        $thumbnailUrl = $uploadResult['secure_url'] ?? null;

        if (!$thumbnailUrl) {
            throw new \RuntimeException(
                'Cloudinary không trả về secure_url.'
            );
        }

        $product->thumbnail = $thumbnailUrl;
        $product->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật ảnh sản phẩm thành công!',
            'thumbnail_url' => $thumbnailUrl,
            'data' => $product->fresh(),
        ]);
    } catch (\Throwable $exception) {
        report($exception);

        return response()->json([
            'status' => false,
            'message' => 'Có lỗi xảy ra khi tải ảnh lên Cloudinary!',
        ], 500);
    }
}

    /**
     * Một màu dùng chung một ảnh ở tất cả các size.
     */
    public function updateVariantImage(
        Request $request,
        int $id,
        int $variantId
    ) {
        $variant = ProductVariant::where('product_id', $id)
            ->findOrFail($variantId);

        $request->validate([
            'image_file' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:5120',
            ],
        ]);

        try {
            $url = Cloudinary::upload(
                $request->file('image_file')->getRealPath(),
                ['folder' => 'obsidian_wear/variants']
            )->getSecurePath();

            $selectedColorKey = $this->variantColorKey($variant->color);
            $matchingVariants = ProductVariant::where('product_id', $id)
                ->get()
                ->filter(
                    fn (ProductVariant $item) =>
                        $this->variantColorKey($item->color) === $selectedColorKey
                );

            DB::transaction(function () use ($matchingVariants, $url) {
                foreach ($matchingVariants as $item) {
                    $item->image = $url;
                    $item->save();
                }
            });

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật ảnh chung cho màu '
                    .$this->normalizeVariantColor($variant->color)
                    .' thành công!',
                'image_url' => $url,
                'updated_variant_ids' => $matchingVariants
                    ->pluck('id')
                    ->values(),
            ]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'status' => false,
                'message' => 'Có lỗi xảy ra khi tải ảnh biến thể!',
            ], 500);
        }
    }
}
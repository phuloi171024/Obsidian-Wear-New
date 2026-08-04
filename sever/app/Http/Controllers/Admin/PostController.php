<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;

class PostController extends Controller
{
    /**
     * Danh sách bài viết
     * GET /admin/posts
     */
    public function index(Request $request)
    {
        $query = Post::with('author:id,name')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $perPage = min((int) $request->get('per_page', 15), 100);

        return response()->json($query->paginate($perPage));
    }

    /**
     * Chi tiết bài viết
     * GET /admin/posts/{id}
     */
    public function show($id)
    {
        $post = Post::with('author:id,name')->findOrFail($id);
        return response()->json($post);
    }

    /**
     * Tạo bài viết mới
     * POST /admin/posts
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'     => 'required|string|max:255',
            'content'   => 'required|string',
            'thumbnail' => 'nullable|string',
            'excerpt'   => 'nullable|string|max:500',
            'category'  => 'nullable|string|max:100',
            'status'    => 'in:draft,published',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $slug = Post::generateSlug($request->title);

        $post = Post::create([
            'user_id'      => $request->user()->id,
            'title'        => $request->title,
            'slug'         => $slug,
            'content'      => $request->content,
            'thumbnail'    => $request->thumbnail,
            'excerpt'      => $request->excerpt,
            'category'     => $request->category,
            'status'       => $request->get('status', 'draft'),
            'published_at' => $request->status === 'published' ? Carbon::now() : null,
        ]);

        return response()->json([
            'message' => 'Tạo bài viết thành công!',
            'post'    => $post->load('author:id,name'),
        ], 201);
    }

    /**
     * Cập nhật bài viết
     * PUT /admin/posts/{id}
     */
    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title'     => 'sometimes|string|max:255',
            'content'   => 'sometimes|string',
            'thumbnail' => 'nullable|string',
            'excerpt'   => 'nullable|string|max:500',
            'category'  => 'nullable|string|max:100',
            'status'    => 'sometimes|in:draft,published',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Cập nhật published_at khi chuyển sang published lần đầu
        if ($request->status === 'published' && $post->status === 'draft') {
            $request->merge(['published_at' => Carbon::now()]);
        }

        $post->update($request->only(
            'title', 'content', 'thumbnail', 'excerpt', 'category', 'status', 'published_at'
        ));

        return response()->json([
            'message' => 'Cập nhật bài viết thành công!',
            'post'    => $post->load('author:id,name'),
        ]);
    }

    /**
     * Xoá mềm bài viết
     * DELETE /admin/posts/{id}
     */
    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Đã xoá bài viết!']);
    }

    /**
     * Publish nhanh
     * PUT /admin/posts/{id}/publish
     */
    public function publish($id)
    {
        $post = Post::findOrFail($id);
        $post->update([
            'status'       => 'published',
            'published_at' => $post->published_at ?? Carbon::now(),
        ]);

        return response()->json([
            'message' => 'Đã đăng bài viết!',
            'post'    => $post,
        ]);
    }

    /**
     * Chuyển về nháp
     * PUT /admin/posts/{id}/draft
     */
    public function draft($id)
    {
        $post = Post::findOrFail($id);
        $post->update(['status' => 'draft']);

        return response()->json([
            'message' => 'Đã chuyển về nháp!',
            'post'    => $post,
        ]);
    }
}

import axiosClient from "../utils/axiosClient";

export const categoryService = {
  // 1. Lấy danh sách danh mục (GET)
  getAll: () => {
    return axiosClient.get("/admin/categories");
  },

  // 2. Thêm mới danh mục (POST)
  create: (data) => {
    return axiosClient.post("/admin/categories", data);
  },

  // 3. Xóa danh mục (DELETE)
  delete: (id) => {
    return axiosClient.delete(`/admin/categories/${id}`);
  },

  // 4. Cập nhật danh mục (PUT)
  update: (id, data) => {
    return axiosClient.put(`/admin/categories/${id}`, data);
  },
};

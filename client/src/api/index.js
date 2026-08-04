import api from './axios'

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login:   (data) => api.post('/login', data),
  logout:  ()     => api.post('/logout'),
  profile: ()     => api.get('/profile'),
}

// ── Admin Dashboard ────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: (params) => api.get('/admin/dashboard', { params }),
}

// ── Admin Products ─────────────────────────────────────────────────────────
export const adminProductApi = {
  list:          (params) => api.get('/admin/products', { params }),
  get:           (id)     => api.get(`/admin/products/${id}`),
  create:        (data)   => api.post('/admin/products', data),
  update:        (id, data) => api.put(`/admin/products/${id}`, data),
  delete:        (id)     => api.delete(`/admin/products/${id}`),
  uploadImages:  (id, data) => api.post(`/admin/products/${id}/images`, data),
  deleteImage:   (id, imgId) => api.delete(`/admin/products/${id}/images/${imgId}`),
  addVariant:    (id, data) => api.post(`/admin/products/${id}/variants`, data),
  updateVariant: (id, vId, data) => api.put(`/admin/products/${id}/variants/${vId}`, data),
  deleteVariant: (id, vId) => api.delete(`/admin/products/${id}/variants/${vId}`),
}

// ── Admin Categories ───────────────────────────────────────────────────────
export const adminCategoryApi = {
  list:   (params) => api.get('/admin/categories', { params }),
  get:    (id)     => api.get(`/admin/categories/${id}`),
  create: (data)   => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id)     => api.delete(`/admin/categories/${id}`),
}

// ── Admin Brands ───────────────────────────────────────────────────────────
export const adminBrandApi = {
  list:   (params) => api.get('/admin/brands', { params }),
  get:    (id)     => api.get(`/admin/brands/${id}`),
  create: (data)   => api.post('/admin/brands', data),
  update: (id, data) => api.put(`/admin/brands/${id}`, data),
  delete: (id)     => api.delete(`/admin/brands/${id}`),
}

// ── Admin Orders ───────────────────────────────────────────────────────────
export const adminOrderApi = {
  list:         (params) => api.get('/admin/orders', { params }),
  get:          (id)     => api.get(`/admin/orders/${id}`),
  updateStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
}

// ── Admin Users ────────────────────────────────────────────────────────────
export const adminUserApi = {
  list:         (params) => api.get('/admin/users', { params }),
  get:          (id)     => api.get(`/admin/users/${id}`),
  update:       (id, data) => api.put(`/admin/users/${id}`, data),
  toggleStatus: (id)     => api.put(`/admin/users/${id}/status`),
}

// ── Admin Coupons ──────────────────────────────────────────────────────────
export const adminCouponApi = {
  list:   (params) => api.get('/admin/coupons', { params }),
  get:    (id)     => api.get(`/admin/coupons/${id}`),
  create: (data)   => api.post('/admin/coupons', data),
  update: (id, data) => api.put(`/admin/coupons/${id}`, data),
  delete: (id)     => api.delete(`/admin/coupons/${id}`),
}

// ── Admin Reviews ──────────────────────────────────────────────────────────
export const adminReviewApi = {
  list:    (params) => api.get('/admin/reviews', { params }),
  approve: (id)     => api.put(`/admin/reviews/${id}/approve`),
  hide:    (id)     => api.put(`/admin/reviews/${id}/hide`),
  delete:  (id)     => api.delete(`/admin/reviews/${id}`),
}

// ── Admin Flash Sales ──────────────────────────────────────────────────────
export const adminFlashSaleApi = {
  list:          (params)        => api.get('/admin/flash-sales', { params }),
  get:           (id)            => api.get(`/admin/flash-sales/${id}`),
  create:        (data)          => api.post('/admin/flash-sales', data),
  update:        (id, data)      => api.put(`/admin/flash-sales/${id}`, data),
  delete:        (id)            => api.delete(`/admin/flash-sales/${id}`),
  addProducts:   (id, data)      => api.post(`/admin/flash-sales/${id}/products`, data),
  removeProduct: (id, productId) => api.delete(`/admin/flash-sales/${id}/products/${productId}`),
}

// ── Admin Posts (Blog) ─────────────────────────────────────────────────────
export const adminPostApi = {
  list:    (params)   => api.get('/admin/posts', { params }),
  get:     (id)       => api.get(`/admin/posts/${id}`),
  create:  (data)     => api.post('/admin/posts', data),
  update:  (id, data) => api.put(`/admin/posts/${id}`, data),
  delete:  (id)       => api.delete(`/admin/posts/${id}`),
  publish: (id)       => api.put(`/admin/posts/${id}/publish`),
  draft:   (id)       => api.put(`/admin/posts/${id}/draft`),
}

import { get, post, put, patch, del, request } from './client.js';

const qs = (params) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') u.set(k, v);
  });
  const s = u.toString();
  return s ? `?${s}` : '';
};

export const authApi = {
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  google: (idToken) =>
    request('/auth/google', { method: 'POST', body: { idToken }, auth: false }),
  logout: () => post('/auth/logout'),
  changePassword: (body) => post('/auth/change-password', body),
  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
  resetPassword: (body) =>
    request('/auth/reset-password', { method: 'POST', body, auth: false }),
  me: () => get('/auth/me'),
};

export const booksApi = {
  list: (params) => get(`/books${qs(params)}`),
  get: (id) => get(`/books/${id}`),
  one: (id) => get(`/books/${id}`),
  create: (body) => post('/books', body),
  update: (id, body) => put(`/books/${id}`, body),
  remove: (id) => del(`/books/${id}`),
};

export const cartApi = {
  get: () => get('/cart'),
  addItem: (body) => post('/cart/items', body),
  updateItem: (id, body) => put(`/cart/items/${id}`, body),
  removeItem: (id) => del(`/cart/items/${id}`),
  add: (bookId, quantity = 1) => post('/cart/items', { bookId, quantity }),
  setQty: (itemId, quantity) => put(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId) => del(`/cart/items/${itemId}`),
  clear: () => del('/cart'),
};

export const ordersApi = {
  list: (params) => get(`/orders${qs(params)}`),
  get: (id) => get(`/orders/${id}`),
  place: (body, idempotencyKey) =>
    post('/orders', body, idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined),
  cancel: (id) => patch(`/orders/${id}/cancel`),
  changeStatus: (id, status) => patch(`/orders/${id}/status`, { status }),
};

export const paymentsApi = {
  create: (orderId) => post('/payments/create', { orderId }),
  verify: (body) => post('/payments/verify', body),
};

export const addressesApi = {
  list: () => get('/addresses'),
  create: (body) => post('/addresses', body),
  update: (id, body) => put(`/addresses/${id}`, body),
  remove: (id) => del(`/addresses/${id}`),
  setDefault: (id) => patch(`/addresses/${id}/default`),
};

export const wishlistApi = {
  list: () => get('/wishlist'),
  add: (bookId) => post('/wishlist', { bookId }),
  remove: (bookId) => del(`/wishlist/${bookId}`),
};

export const reviewsApi = {
  list: (params) => get(`/reviews${qs(params)}`),
  create: (body) => post('/reviews', body),
  update: (id, body) => put(`/reviews/${id}`, body),
  remove: (id) => del(`/reviews/${id}`),
};

export const usersApi = {
  list: (params) => get(`/users${qs(params)}`),
  get: (id) => get(`/users/${id}`),
  create: (body) => post('/users', body),
  update: (id, body) => put(`/users/${id}`, body),
  remove: (id) => del(`/users/${id}`),
  updateMe: (body) => put('/users/me', body),
};

export const inventoryApi = {
  list: (params) => get(`/inventory${qs(params)}`),
  update: (bookId, body) => put(`/inventory/${bookId}`, body),
};


export const addressApi = addressesApi;
export const userApi = usersApi;
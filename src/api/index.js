import { get, post, put, del, request } from './client.js';

const qs = (params) => {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') u.set(k, v); });
  const s = u.toString();
  return s ? `?${s}` : '';
};

export const authApi = {
  login: (body) => request('/auth/login', { method: 'POST', body, auth: false }),
  register: (body) => request('/auth/register', { method: 'POST', body, auth: false }),
  logout: () => post('/auth/logout'),
  changePassword: (body) => post('/auth/change-password', body),
};
export const userApi = { update: (id, body) => put(`/users/${id}`, body) };
export const booksApi = {
  list: (p) => get(`/books${qs(p)}`),
  one: (id) => get(`/books/${id}`),
};
export const reviewsApi = {
  list: (bookId) => get(`/reviews${qs({ bookId, limit: 50 })}`),
  create: (body) => post('/reviews', body),
};
export const cartApi = {
  get: () => get('/cart'),
  add: (bookId, quantity = 1) => post('/cart/items', { bookId, quantity }),
  setQty: (itemId, quantity) => put(`/cart/items/${itemId}`, { quantity }),
  remove: (itemId) => del(`/cart/items/${itemId}`),
};
export const addressApi = {
  list: () => get('/addresses'),
  create: (body) => post('/addresses', body),
  update: (id, body) => put(`/addresses/${id}`, body),
  remove: (id) => del(`/addresses/${id}`),
};
export const ordersApi = {
  list: (p) => get(`/orders${qs(p)}`),
  place: (addressId, key) => post('/orders', { addressId }, { 'Idempotency-Key': key }),
};
export const wishlistApi = {
  list: () => get('/wishlist'),
  add: (bookId) => post('/wishlist', { bookId }),
  remove: (bookId) => del(`/wishlist/${bookId}`),
};

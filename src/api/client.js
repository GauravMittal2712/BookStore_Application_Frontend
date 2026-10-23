// Thin fetch wrapper for the bookstore API.
//  - success envelope: { success: true, data, meta }
//  - error envelope:   { success: false, error: { code, message, details } }
// The access token lives in memory only; the refresh token is an httpOnly cookie.
const BASE = import.meta.env.VITE_API_URL || '/api/v1';

let accessToken = null;
let refreshPromise = null;
let onAuthLost = () => {};

export const setAccessToken = (t) => { accessToken = t; };
export const setAuthLostHandler = (fn) => { onAuthLost = fn; };

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function raw(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'include',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Please check your connection.');
  }
  if (res.status === 204) return { success: true, data: null };
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok) {
    throw new ApiError(res.status, json?.error?.code || 'ERROR', json?.error?.message || 'Something went wrong', json?.error?.details);
  }
  return json;
}

// Refresh tokens rotate, and re-using an old one revokes the whole session on the server.
// So concurrent callers MUST share one in-flight request.
export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = raw('/auth/refresh', { method: 'POST', auth: false })
      .then((r) => { accessToken = r.data.accessToken; return r.data; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function request(path, opts = {}) {
  try {
    return await raw(path, opts);
  } catch (e) {
    const expired = e.status === 401 && e.code === 'TOKEN_INVALID' && opts.auth !== false;
    if (!expired) throw e;
    try {
      await refreshSession();
    } catch {
      accessToken = null;
      onAuthLost();
      throw e;
    }
    return raw(path, opts);
  }
}

export const get = (p) => request(p);
export const post = (p, body, headers) => request(p, { method: 'POST', body: body ?? {}, headers });
export const put = (p, body) => request(p, { method: 'PUT', body });
export const patch = (p, body) => request(p, { method: 'PATCH', body: body ?? {} });
export const del = (p) => request(p, { method: 'DELETE' });

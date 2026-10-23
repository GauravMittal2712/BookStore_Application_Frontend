# Bookstore frontend

React 18 + Vite UI for `bookstore-backend`. Pages: books list (search, sort, pagination), book detail with
reviews, login / signup, forgot password, cart + checkout (address, order summary), order placed,
my orders, wishlist, profile (personal details, password change, addresses).

## Run

```bash
# 1) backend (needs MongoDB replica set, see backend README)
cd bookstore-backend && npm install && npm run seed && npm run dev      # http://localhost:5000

# 2) frontend
cd bookstore-frontend && npm install && npm run dev                      # http://localhost:5173
```

`npm run dev` proxies `/api` to `http://localhost:5000` (change with `VITE_PROXY_TARGET`), so the httpOnly
refresh cookie stays same-origin. Backend `CLIENT_ORIGIN` must be `http://localhost:5173` (already the default).
For a separate API origin set `VITE_API_URL` (see `.env.example`). `npm run build` outputs `dist/`.

## Notes
- Prices come from the API in paise and are shown as `Rs. N`.
- Books without `coverImageUrl` get a generated cover; set `coverImageUrl` on a book to show a real image.
- Strikethrough price = `originalPrice` (optional field added to the backend Book model).
- Store contact details on the "Order placed" page live in `src/config.js`.
- Not built yet: Facebook/Google login, password reset by email (no backend endpoint), "Notify me".

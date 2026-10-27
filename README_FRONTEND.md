# Bookstore Frontend

A responsive React web interface for the Bookstore application. It connects to the `bookstore-backend` REST API.

## Technology Stack

- **React 18** — component-based UI
- **Vite** — development server and production build tool
- **React Router** — client-side navigation
- **CSS** — global application styling
- **Fetch/API client modules** — communication with the backend API

## Features

- Browse books with search, sorting, and pagination
- View book details and reviews
- Register, log in, and access account pages
- View and manage a shopping cart
- Checkout with address and order summary
- View order confirmation and order history
- Manage wishlist and profile details
- Manage addresses and change password
- Admin screens for books, inventory, orders, and users
- Reusable components for layout, navigation, pagination, book covers, and notifications

> The UI includes forgot/reset-password pages, but email-based password reset depends on backend support and is noted as not fully implemented. Google/Facebook login is not currently implemented.

## Project Structure

```text
bookstore-frontend/
├── public/               # Static assets and illustrations
├── src/
│   ├── api/              # API client and endpoint helpers
│   ├── components/      # Shared UI components
│   ├── context/         # Authentication, cart, and toast contexts
│   ├── pages/           # Customer pages
│   │   └── admin/        # Admin dashboard pages
│   ├── styles/           # Global CSS
│   ├── utils/            # Formatting and payment helpers
│   ├── App.jsx           # Routes and application composition
│   ├── config.js         # Frontend configuration/contact details
│   └── main.jsx          # React entry point
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

## Prerequisites

- Node.js 20 or later recommended
- npm
- The Bookstore backend running locally or a reachable deployed API

## Getting Started

1. Start and configure the backend first. Follow the backend repository's README and ensure the API is available at `http://localhost:5000`.
2. Open a separate terminal in `bookstore-frontend`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create the local environment file if needed:

   ```bash
   cp .env.example .env
   ```

   On Windows Command Prompt, use `copy .env.example .env`.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:5173` in your browser.

## Environment Configuration

The Vite development server proxies `/api` requests to the backend at `http://localhost:5000` by default.

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Optional API base URL for a separately hosted backend, for example `https://your-api.example.com/api/v1` |
| `VITE_PROXY_TARGET` | Optional backend origin used by the Vite development proxy |

If the frontend and backend are deployed on separate origins, set `VITE_API_URL` to the backend API base URL and configure the backend's `CLIENT_ORIGIN` to the exact frontend origin. Authentication cookies and CORS must be configured consistently.

**Important:** Vite exposes variables prefixed with `VITE_` to the browser. Do not put passwords, private keys, or other secrets in frontend environment variables.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production files into `dist/` |
| `npm run preview` | Preview the production build locally |

Before deployment, run:

```bash
npm run build
```

The generated `dist/` directory contains the static frontend build. Deploy it to a static hosting provider and configure SPA fallback/rewrite rules so React Router routes load correctly.

## Connecting to the Backend

- Local development normally uses the Vite proxy, so API calls can use the `/api` path.
- The backend should allow the frontend origin configured in `CLIENT_ORIGIN`.
- Keep the backend API base URL consistent with the deployed environment.
- If authentication uses HTTP-only cookies, configure cross-origin cookie and CORS settings appropriately when the frontend and API use different domains.

## Development Notes

- Prices returned by the API are represented in paise and formatted for display by the UI.
- A generated book cover is used when a book does not provide a `coverImageUrl`.
- Store contact details displayed on the order confirmation page are configured in `src/config.js`.

## Security

- Never commit `.env` files or credentials.
- Do not store backend secrets in frontend code or `VITE_*` variables.
- Treat all frontend validation as a user-experience aid; the backend must validate and authorize every protected operation.

## License

Add a license file if you intend to distribute this project publicly.

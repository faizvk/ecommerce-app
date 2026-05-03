# NexKart — Full-stack e-commerce platform

> Modern shopping experience with Razorpay checkout, real-time order tracking, admin dashboard, sale offers, and an indigo–violet brand identity.

[![CI](https://github.com/faizvk/ecommerce-app/actions/workflows/ci.yml/badge.svg)](https://github.com/faizvk/ecommerce-app/actions/workflows/ci.yml)
[![Live demo](https://img.shields.io/badge/demo-live-4f46e5?logo=vercel)](https://ecommerce-frontend-eight-blush.vercel.app/)

---

## ✨ Highlights

- **Complete shopping flow** — catalog → product detail → cart → checkout → tracking, with offer pricing applied in real time
- **Razorpay** integration with server-side amount computation, idempotent order placement, atomic stock reservation, profile-completeness gate before payment, and signed verification
- **Admin dashboard** — products, offers (with timed sales), orders, users, plus charts on weekly revenue and trending products
- **Wishlist + recently-viewed** with localStorage persistence
- **Branded toast system** with 8 contextual variants (cart/wishlist/order/info/warn/error/success/promo)
- **Smart search** with autocomplete, URL-driven filters with chips, ellipsis pagination
- **Auto-expiring offers** — backend filters out expired offers in queries, frontend ticks down a live countdown banner
- **33 passing tests** (24 frontend + 9 backend) and a CI workflow that runs lint + test + build on every PR
- **Hardened backend** — Zod env validation, structured pino logs with request IDs, per-route rate limits, account lockout, centralized error envelope, hybrid Redis cache

---

## 🏛️ Architecture

```
ecommerce-app/
├── ecommerce-backend/        # Node 20 + Express 5 + Mongoose 9
│   ├── auth/                 # JWT verify + role guard
│   ├── config/               # env (Zod-validated), logger (pino), db, redis
│   ├── constants/            # ROLES, ORDER_STATUS, PAYMENT_STATUS, ERROR_CODES
│   ├── controller/           # request handlers
│   ├── middleware/           # asyncHandler, AppError, errorHandler, requestId, httpLogger, rateLimiters
│   ├── model/                # User, Product, Cart, Order, Offer
│   ├── routes/               # Express routers
│   ├── scripts/              # seedProducts.js
│   ├── tests/                # vitest + supertest
│   └── utils/                # productCache, validStatus, sendEmail, googleClient
└── ecommerce-frontend/       # React 19 + Vite 7 + Redux Toolkit
    └── src/
        ├── admin/            # admin dashboard (lazy-loaded)
        ├── animations/       # fade-in scroll hook
        ├── api/              # axios client + endpoint wrappers
        ├── components/       # shared UI (Navbar, ProductCard, ProductRow…)
        │   └── ui/           # Button, Skeleton primitives
        ├── hooks/             # useWishlist, useRecentlyViewed, useDebouncedCallback
        ├── pages/            # routed pages
        ├── redux/            # slices + memoized selectors
        ├── routes/           # ProtectedRoute / GuestRoute / AdminProtectedRoute
        ├── test/             # vitest setup
        └── utils/            # constants, notify, applyOffer, productMeta
```

### Tech choices

| Concern | Choice | Why |
|---|---|---|
| Server framework | Express 5 | Familiar, light, plays well with Render free tier |
| ORM | Mongoose 9 | Schema validation + middleware hooks, Mongo native |
| Validation | Zod | Single library covers env vars + (future) request bodies |
| Auth | JWT (access + refresh) | Refresh in `httpOnly` cookie, access via `Authorization` header |
| Payments | Razorpay | India-focused; server-side order creation + signed verification |
| Cache | Redis (optional) | Versioned product cache; soft-fails to DB if Redis offline |
| Logger | pino + pino-http | Structured JSON in prod, pretty in dev |
| State (FE) | Redux Toolkit + reselect | Memoised selectors for derived collections |
| Routing (FE) | React Router 7 | Lazy-loaded routes, sticky scroll |
| Styling | Tailwind 3 | Brand tokens via CSS vars in `tailwind.config.js` |
| Tests | Vitest + Supertest + Testing Library | Same runner everywhere |

---

## 🚀 Local development

### Prerequisites
- Node 20.x
- MongoDB (local Docker or Atlas free tier)
- *(optional)* Redis for product caching
- *(optional)* Razorpay test keys for checkout

### Backend

```bash
cd ecommerce-backend
npm install
cp .env.example .env       # then fill in the values below
npm run dev
```

Required env vars (validated at boot):

| Var | Example |
|---|---|
| `MONGOOSE_URI` | `mongodb://localhost:27017/nexkart` |
| `CLIENT_URL` | `http://localhost:5173` |
| `ACCESS_SECRET_KEY` | 16+ char random string |
| `REFRESH_SECRET_KEY` | 16+ char random string |

Optional:
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — payments
- `SMTP_*` — password reset emails
- `GOOGLE_CLIENT_ID` — Google OAuth
- `REDIS_URL` — caching layer
- `LOG_LEVEL` — `debug | info | warn | error` (default `info`)

### Frontend

```bash
cd ecommerce-frontend
npm install
echo 'VITE_BASE_URL="http://localhost:3000/api"' > .env
npm run dev
```

### Seed sample products

```bash
cd ecommerce-backend && npm run seed
```

This wipes existing products (intentionally) and inserts 30 per category (150 total) with realistic copy and on-theme Loremflickr images.

---

## 🧪 Testing & quality

```bash
cd ecommerce-backend && npm test          # 9 tests (Vitest + Supertest)
cd ecommerce-frontend && npm test         # 24 tests (Vitest + Testing Library)
cd ecommerce-backend && npm run lint
cd ecommerce-frontend && npm run lint
```

CI runs everything on every PR + every push to `main`. PRs that fail lint or test should not merge.

### What's covered today
- Backend: health endpoint, request id propagation, error envelope (AppError + unknown error redaction), 404 handler, asyncHandler async-throw forwarding
- Frontend: offer pricing maths, product badge derivation, free-delivery threshold, wishlist add/remove/persist/clear
- Build verification

See [`FUTURE_WORK.md`](./FUTURE_WORK.md) for the test-coverage gap and the plan to close it.

---

## 🔒 Security model

- **Refresh token** lives in `httpOnly`, `sameSite` cookie. Access token is currently in `localStorage` — see future-work for the migration to in-memory + silent refresh.
- **Account lockout** — soft-locks an account for 15 min after 5 consecutive failed login attempts.
- **Rate limits** — `/login`, `/signup`: 10 / 10 min · `/forgot-password`, `/reset-password`: 5 / 1 h · `/payment/*`: 30 / 15 min · everything else: 1000 / 15 min.
- **Payment integrity** — `/payment/create-order` recomputes the amount from the user's cart server-side; the frontend can't tamper with it. `placeOrder` is idempotent on `razorpayOrderId` (DB unique sparse index) and reserves stock atomically (with rollback if any item fails).
- **CORS** locked to `CLIENT_URL`; `helmet` enabled with strict referrer policy.

---

## 📦 Deployment

| Surface | Host | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploy on `main` push |
| Backend | Render | Free tier sleeps; UptimeRobot pings `/api/health` every 5 min |
| Database | MongoDB Atlas | M0 free tier |
| Cache | Redis (optional) | Soft-fails to DB if not configured |
| Images | Cloudinary | Upload from admin form |

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md). PRs must:
1. Pass `npm run lint` in any workspace touched
2. Pass `npm test`
3. Use [Conventional Commits](https://www.conventionalcommits.org/)
4. Fill out the PR template

---

## 📜 License

ISC. See [`LICENSE`](./LICENSE) (if added).

## 🙏 Credits

Build by [Faiz VK](https://github.com/faizvk).
Product photos via [Loremflickr](https://loremflickr.com/) (placeholder data — replace with real assets before going live).

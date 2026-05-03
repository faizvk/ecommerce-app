# Future Work

The audit identified 30 items that would move this from "polished side-project" to "professional production app". This file tracks what's done, what's in flight, and what's deliberately deferred.

Legend: ✅ done · 🔄 partial · ⏳ deferred (with rationale)

---

## ✅ Done

### Tooling & process
- Editor / formatter config (`.editorconfig`, `.prettierrc.json`, `.prettierignore`)
- `CONTRIBUTING.md`, `CHANGELOG.md`, `CODEOWNERS`
- PR template + Bug / Feature issue templates
- Backend devDeps for ESLint, Prettier, Vitest, Supertest
- Backend ESLint flat config

### Backend hardening
- Zod-validated env vars at boot (with multi-file `.env` resolver)
- Structured logger (`pino`) with field redaction (passwords, tokens, signatures)
- Per-request `X-Request-Id` correlation
- Centralized error envelope (`AppError` class + `errorHandler` middleware)
- `asyncHandler` to remove try/catch boilerplate
- Per-route rate limits (auth, payment, password-reset, global fallback)
- Account lockout after 5 failed login attempts (15-min soft-lock + Retry-After)
- `routes/` folder name (was the confusing `view/`)
- Disable `x-powered-by`, tighter `helmet` referrer policy

### Constants & enums
- `ecommerce-backend/constants/index.js` (ROLES, ORDER_STATUS, PAYMENT_STATUS, ERROR_CODES)
- `ecommerce-frontend/src/utils/constants.js` mirrors the backend

### UI primitives & UX polish
- `<Button>` with 6 variants × 3 sizes × button/Link/anchor polymorphism
- `<Skeleton>` + `ProductCardSkeleton` + `ProductCardSkeletonGrid` + `ProductRowSkeleton`
- Home and SearchResults first-load now use skeleton (not centered spinner)

### Tests
- Backend: 9 tests (health, request-id propagation, error envelope, asyncHandler)
- Frontend: 24 tests (offer pricing, product badges, wishlist add/remove/persist)

### CI workflow file
- `.github/workflows/ci.yml` exists in this repo (you may need to add it via the GitHub web UI if your local PAT lacks `workflow` scope) — runs lint + test on backend, lint + test + build on frontend, on every PR and `main` push.

---

## 🔄 Partial

### Test coverage
- Solid scaffolding (Vitest, Supertest, Testing Library, JSDOM, mocks for IntersectionObserver/matchMedia).
- 33 tests is the floor — happy paths only. Error-path tests for auth/payment/cart still TODO. Target: 60%+ statement coverage on backend controllers and ≥ 5 component-level tests for high-traffic pages (Cart, Checkout, ProductCard).

### Adoption of new primitives
- `<Button>` and `<Skeleton>` exist but ~30 ad-hoc Tailwind buttons still live across pages. Migration is a follow-up — refactor opportunistically as pages are touched.

### Adoption of `AppError` + `asyncHandler` in controllers
- Middleware is in place; existing controllers still hand-roll try/catch + `res.status(...).json(...)`. Migration to `asyncHandler(req, res) => { … throw new AppError(…) }` should happen one controller at a time.

### ProductDetails decomposition
- File is 1,132 lines. Should be split into ~6 components (Gallery, PriceBox, QtyStepper, TabsSection, ShippingChecker, RecentlyViewed). Deferred — works correctly today, refactor when modifying the page anyway.

---

## ⏳ Deferred (and why)

### TypeScript migration
**Status**: not started.
**Rationale**: ~80 file refactor; the project ships fine in JS today; defer until the surface stops moving.
**Plan when ready**: convert frontend first (lower stakes than backend), file-by-file with `// @ts-check` JSDoc as a stepping stone.

### `accessToken` in `localStorage`
**Status**: token still in `localStorage`.
**Rationale**: real fix is in-memory access token + `httpOnly` refresh cookie + silent refresh on 401. Touches `api/api.js`, every protected page, all of auth slice. ~1-day refactor + careful regression testing. Documented as a known gap in the security section of `README.md`.

### CSRF token on `/refresh`
**Status**: relying on `sameSite` + `Origin` checks (implicitly via CORS allowlist).
**Rationale**: current configuration prevents the most common attacks given `CLIENT_URL` is whitelisted; full CSRF token rotation can be added when `accessToken` is moved out of localStorage.

### Email verification + transactional emails
**Status**: only password reset email is implemented.
**Rationale**: requires email template system + queue (BullMQ) for retries; out of scope for this round. Order confirmation + shipping update emails are the next features.

### API versioning (`/api/v1`)
**Status**: still mounted at `/api`.
**Rationale**: introducing `/v1` requires a coordinated frontend env-var change + a transition period. Will do when first breaking API change lands.

### Cloudinary signed uploads
**Status**: unsigned upload preset in use.
**Rationale**: signed uploads require a backend endpoint that issues a signature; ~30 min change. Deferred until production launch.

### Sentry / error tracking
**Status**: errors logged via pino but not aggregated.
**Rationale**: Sentry SDK plus DSN secret. Trivial to add — will land when the project is shared with real users.

### Storybook / design system
**Status**: not started.
**Rationale**: payoff scales with team size; with one contributor the in-tree components serve the same purpose.

### i18n
**Status**: hard-coded English + INR.
**Rationale**: India-only product. Add when expanding.

### PWA / service worker
**Status**: none.
**Rationale**: not needed for the current shape; revisit if mobile drop-off becomes a concern.

### Background jobs (BullMQ)
**Status**: none.
**Rationale**: no job needs queuing today (offers expire on read; stock updates are synchronous). Will add when abandoned-cart emails or scheduled offer activation lands.

### Analytics (GA / Mixpanel / PostHog)
**Status**: none.
**Rationale**: would be added before launch; trivial.

---

## Top 5 next moves (ordered by leverage)

1. **Adopt `<Button>` and `<Skeleton>` everywhere** — visual consistency win, low risk.
2. **Convert critical controllers to `asyncHandler` + `AppError`** — reduces boilerplate, removes duplicated try/catch.
3. **Split ProductDetails into sub-components** — biggest single readability win in the repo.
4. **Add 10 more backend tests** covering the auth flow (signup, login w/lockout, refresh, logout) and payment flow (create-order with stale cart, idempotent placeOrder).
5. **Wire Sentry** with the existing pino integration — 5 lines of config gives production observability.

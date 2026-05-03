# Changelog

All notable changes to NexKart will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Pino structured logging with request IDs for backend traceability.
- Per-route rate limits: tighter limits on `/login`, `/signup`, `/forgot-password`, `/payment/*`.
- Account lockout after repeated failed login attempts.
- Centralized error envelope middleware (`{ success, data?, error: { code, message } }`).
- Zod-based env validation at backend boot.
- UI primitives (`Button`, `Skeleton`) for design consistency.
- Backend ESLint, Prettier, Vitest, supertest scaffolding.
- CI workflow (lint + test + build on every PR).
- Issue and PR templates, `CODEOWNERS`, `CONTRIBUTING.md`.

### Changed
- Renamed `ecommerce-backend/view/` → `ecommerce-backend/routes/` to match Express convention.
- Roles and order statuses moved to `constants/` (no more magic strings).

### Fixed
- See git history for granular fix commits prior to this changelog.

## [0.9.0] — 2026-05-03

### Added
- Branded toast notification system (`utils/notify.js`) with 8 contextual variants.
- Wishlist with localStorage persistence + "Move to cart" bulk action.
- Offer/sale workflow: admin creates timed offers, products auto-revert at expiry, live countdown banner.
- Recently-viewed tracking on Product Details.
- Smart Pagination with ellipsis + URL-driven filters on Search Results.
- Order tracking page with 4-step visual timeline.
- Newsletter banner, testimonials section, promotional banner row on Home.
- Quantity stepper on cards and Product Details.
- Memoized Redux selectors (`redux/selectors.js`) for cart/products derived data.
- ScrollToTop on every route change.
- ErrorBoundary around routes.

### Fixed
- Amount tampering vulnerability — backend now computes payment amount server-side.
- Idempotent order placement — duplicate Razorpay order IDs return existing order.
- Atomic stock reservation with rollback if any item fails.
- Profile completion validated before Razorpay order creation (was after — could take money with no order).
- Cart items state leaking across user sessions on logout/login.
- ProductCard heights varying inside `ProductRow` (added `h-full`).
- `useFadeInScroll` re-hiding cards when they exited viewport on mobile.
- Stale cart references after seed/product delete (auto-purged on `getCart`).

## [0.5.0] — 2026-04-30

Initial public release: catalog, cart, Razorpay checkout, admin (products / orders / users), auth (email + Google).

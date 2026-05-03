# Contributing to NexKart

Thanks for taking the time to contribute. This doc covers the local setup, the coding standards, and how to send a PR.

## Repository layout

```
ecommerce-app/
├── ecommerce-backend/   # Express + Mongoose API
│   ├── auth/            # JWT middleware + role guard
│   ├── config/          # env, db, redis bootstrap
│   ├── constants/       # shared constants (roles, statuses)
│   ├── controller/      # request handlers
│   ├── middleware/      # error envelope, async handler, request id
│   ├── model/           # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── scripts/         # seed scripts
│   ├── tests/           # vitest + supertest
│   └── utils/           # shared helpers
└── ecommerce-frontend/  # React + Vite + Redux Toolkit
    └── src/
        ├── admin/       # admin dashboard
        ├── animations/  # fade hooks
        ├── api/         # axios client + endpoint wrappers
        ├── components/  # shared UI (Navbar, ProductCard, ui/* primitives)
        ├── hooks/       # cross-cutting hooks
        ├── pages/       # routed page components
        ├── redux/       # slices + selectors
        └── utils/       # constants, notify, helpers
```

## Local setup

**Prerequisites**: Node 18+, MongoDB (local or Atlas free tier), optional Redis.

```bash
# 1. Backend
cd ecommerce-backend
npm install
cp .env.example .env       # fill in MONGOOSE_URI etc.
npm run dev                # nodemon, port 3000 by default

# 2. Frontend (in another terminal)
cd ../ecommerce-frontend
npm install
echo 'VITE_BASE_URL="http://localhost:3000/api"' > .env
npm run dev                # vite, port 5173
```

**Optional**: seed the products catalogue once you have an admin user:
```bash
cd ecommerce-backend && npm run seed
```

## Code standards

### Style
- **Prettier** is the source of truth for formatting. Run `npm run format` before committing.
- **ESLint** must pass: `npm run lint` in either workspace.
- 2-space indent, LF line endings, no trailing whitespace (enforced via `.editorconfig`).

### Commits
Use [Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add wishlist persistence to backend
fix: prevent cart leak across user sessions
chore: bump mongoose to 9.x
docs: explain offer expiry workflow
```

### File organization
- Components > 300 lines should be split.
- Pure helpers go in `utils/`, stateful logic in `hooks/`.
- New API endpoints get a route file in `routes/`, a controller, and at least one supertest case.
- Magic strings (roles, order statuses) live in `constants/`.

### State management (frontend)
- **URL params** are the source of truth for filterable views (search, listings).
- **Redux** holds shared server state (cart, products, orders, offers, user).
- **Local state** for ephemeral UI only (form drafts, modal open/close).
- Use the memoized selectors in `redux/selectors.js`; don't recompute derived data per component.

### API contract
- All responses use the shape `{ success, data?, error? }` (see `middleware/errorEnvelope.js`).
- Errors include a stable `code` plus a human `message`.
- Routes are mounted under `/api`; new versions go under `/api/v2/...` if breaking.

## Testing

- Backend: `cd ecommerce-backend && npm test`
- Frontend: `cd ecommerce-frontend && npm test`

PRs that touch behaviour need a test. Aim to cover the happy path and at least one error case.

## Sending a PR

1. Fork + branch (`feat/your-feature` or `fix/short-description`).
2. Run `npm run lint` and `npm test` in any workspace you touched.
3. Fill in the PR template — what changed, screenshots for UI changes, manual test steps.
4. CI must be green before review.

Tag `@faizvk` for review. Squash merge into `main`.

## Reporting issues

Please use the issue templates (Bug / Feature) — they ask for repro steps and acceptance criteria so we can move faster.

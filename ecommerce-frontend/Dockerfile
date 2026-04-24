# ── ecommerce-frontend/Dockerfile ───────────────────────────────────────────

# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package.json package-lock.json ./
RUN npm ci

# Build-time env vars (Vite bakes these in at build time).
# When served behind nginx, VITE_BASE_URL can be empty — nginx proxies /api.
# Override via --build-arg if deploying directly to a public URL.
ARG VITE_BASE_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_CLOUDINARY_UPLOAD_URL=""
ARG VITE_CLOUDINARY_UPLOAD_PRESET=""

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_CLOUDINARY_UPLOAD_URL=$VITE_CLOUDINARY_UPLOAD_URL
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET

COPY . .
RUN npm run build

# ── Stage 2: Serve ──────────────────────────────────────────────────────────
FROM nginx:stable-alpine

# Copy the compiled SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx config with our SPA + proxy config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove the default server block from the main config (already included via conf.d)
RUN rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

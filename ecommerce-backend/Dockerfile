# ── ecommerce-backend/Dockerfile ────────────────────────────────────────────
FROM node:22-alpine

# Install dumb-init for proper PID 1 signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Run as non-root
USER node

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]

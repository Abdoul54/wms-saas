# ───────────────────────────────────────────
# Base
# ───────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app

# ───────────────────────────────────────────
# Dev — hot reload via volume mount
# ───────────────────────────────────────────
FROM base AS dev
COPY package.json package-lock.json* ./
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ───────────────────────────────────────────
# Builder
# ───────────────────────────────────────────
FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ───────────────────────────────────────────
# Prod — standalone output
# ───────────────────────────────────────────
FROM base AS prod
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
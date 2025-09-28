# Étape dev
FROM node:20-alpine AS development
WORKDIR /app

RUN addgroup -g 1001 -S frontend && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G frontend frontend

# Create cache directories with proper permissions
RUN mkdir -p /app/.cache/node /app/.pnpm-store /app/node_modules/.cache /tmp/corepack && \
    chown -R frontend:frontend /app/.cache /app/.pnpm-store /tmp/corepack

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY --chown=frontend:frontend . .
USER frontend
EXPOSE 5173
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

# Étape build
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_URL_PRODE
ARG VITE_PORT_PRODE
ARG VITE_HOSTNAME

ENV VITE_URL_PRODE=$VITE_URL_PRODE
ENV VITE_PORT_PRODE=$VITE_PORT_PRODE
ENV VITE_HOSTNAME=$VITE_HOSTNAME

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Étape prod
FROM node:20-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S frontend && \
    adduser -S -D -H -u 1001 -h /app -s /sbin/nologin -G frontend frontend

COPY --from=builder --chown=frontend:frontend /app/dist ./dist
RUN npm install -g serve

ENV NODE_ENV=production
USER frontend
EXPOSE 5173
CMD ["serve", "-s", "-l", "5173", "dist"]

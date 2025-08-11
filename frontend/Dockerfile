# Étape dev
FROM node:20-alpine AS development
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY . .
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

COPY --from=builder /app/dist ./dist
RUN npm install -g serve

ENV NODE_ENV=production
USER node
EXPOSE 5173
CMD ["serve", "-s", "-l", "5173", "dist"]

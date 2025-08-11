# Frontend dev image for Vite
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy the rest of the source
COPY . .

EXPOSE 5173

# Default command is overridden by docker-compose; keep a sensible default for local runs
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

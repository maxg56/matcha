# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Matcha is a microservices-based dating application with the following key components:

### Core Services
- **Gateway** (Go, :8080): API Gateway with JWT validation, reverse proxy, and CORS handling
- **Auth Service** (Go, :8001): User authentication, JWT token management, Redis token blacklisting
- **User Service** (Go, :8002): User profiles and management
- **Match Service** (Python, :8003): Matching algorithm and logic
- **Chat Service** (Go, :8004): Real-time messaging with WebSocket support
- **Notify Service** (Python, :8005): Push notifications
- **Media Service** (Python, :8006): Image upload and processing
- **Frontend** (React, :3000): Web application

### Infrastructure
- **PostgreSQL**: Primary database (matcha_dev for development)
- **Redis**: Token blacklisting and caching
- **Caddy**: Reverse proxy (port 8000 for development)

## Development Commands

### Environment Setup
```bash
# Start all services (creates volumes, launches containers)
make

# Stop services
make stop

# Remove containers and volumes
make down

# Restart all services
make restart

# Production deployment
make prod
```

### Service-Specific Development

**Go Services (gateway, auth-service, user-service, chat-service):**
```bash
cd api/<service-name>
go mod tidy
cd src
go build              # Compile
go run main.go        # Run locally
go test -v .          # Run tests
go test -v . -run TestName  # Run specific test
```

**Auth Service has a dedicated test script:**
```bash
cd api/auth-service
./test.sh             # Full test suite with coverage
```

**Python Services (match-service, notify-service, media-service):**
```bash
cd api/<service-name>
pip install -r requirements.txt
cd src
python main.py        # Run locally
pytest               # Run tests
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run dev         # Development server
pnpm test           # Run tests
pnpm run lint       # Linting
```

### Docker Environment
```bash
# Use .env.dev for development
docker compose -f docker-compose.dev.yml --env-file .env.dev up -d

# Check logs for specific service
docker logs matcha-<service-name>-1

# Access database
docker exec matcha-postgres-1 psql -U postgres -d matcha_dev
```

## Key Architectural Patterns

### Auth Service Code Organization
The auth-service follows a clean, modular structure:

```
src/
├── handlers/         # HTTP handlers by function (auth.go, token.go, password.go)
├── utils/           # Utilities (jwt.go, response.go)
├── middleware/      # Authentication middleware
├── conf/           # Database and Redis connections
├── models/         # GORM database models
├── types/          # Custom types (gender.go)
└── main.go         # Application entry point
```

**Response Format**: All APIs use standardized JSON responses via `utils.RespondSuccess()` and `utils.RespondError()`:
```json
{
  "success": true/false,
  "data": {...},        // Success responses only
  "error": "message"    // Error responses only
}
```

### Gateway JWT Flow
1. **Authentication**: Auth service issues JWT tokens with Redis blacklisting support
2. **Gateway Validation**: `jwtMiddleware()` validates tokens and checks Redis blacklist
3. **Service Communication**: Gateway forwards `X-User-ID` and `X-JWT-Token` headers to upstream services
4. **Token Blacklisting**: Logout immediately blacklists tokens in Redis with TTL

### Database Connection Pattern
Go services use GORM with PostgreSQL. Database connection is centralized in `conf/db.go`:
- Connection details from environment variables (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)
- Auto-migration controlled by `AUTO_MIGRATE=true` environment variable
- Fallback to defaults for missing environment variables

### Environment Variable Hierarchy
1. `.env.dev` - Development configuration (committed)
2. `.env` - Local overrides (gitignored)
3. Docker environment variables
4. Fallback defaults in code

## Testing Guidelines

### Auth Service Testing
- Tests use in-memory SQLite database
- JWT tokens generated with test secrets
- Response format: `{"success": bool, "data": {...}, "error": "..."}`
- Registration requires: username, email, password, first_name, last_name, birth_date, gender, sex_pref
- Login uses "login" field (username or email) + password

### Gateway Testing
- Tests JWT middleware functionality
- Validates CORS headers
- Tests proxy request forwarding
- Checks Redis blacklist integration

## Common Development Issues

### Database Connection Issues
- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check environment variables match `.env.dev`
- Database name is `matcha_dev` for development
- Default password is `password`

### JWT Token Issues
- Gateway validates tokens before forwarding requests
- Blacklisted tokens return "token revoked" error
- Missing JWT_SECRET causes server misconfiguration errors
- Token format: `Authorization: Bearer <token>`

### Service Communication
- All services communicate through the gateway in production
- Direct service access available in development
- Health endpoints available at `/health` for all services
- Gateway maps friendly URLs to service-specific paths

## Code Quality

The project uses pre-commit hooks for code quality:
```bash
./setup-precommit.sh      # Standard Linux setup
./setup-precommit-arch.sh # Arch Linux setup
pre-commit run --all-files
```

Quality checks include:
- Go: `go fmt`, `go vet`
- Python: `black`, `isort`, `flake8` 
- Frontend: ESLint
- General: trailing whitespace, YAML validation

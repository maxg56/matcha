# Auth Service Documentation

## 📋 Overview

The Auth Service is a microservice responsible for user authentication and authorization in the Matcha application. It provides JWT-based authentication with Redis blacklisting support.

## 🏗️ Architecture

```
auth-service/
├── src/
│   ├── conf/           # Configuration files
│   │   ├── db.go      # Database connection
│   │   └── redis.go   # Redis connection & JWT blacklist
│   ├── handlers/       # HTTP handlers
│   │   ├── auth.go    # Registration & login
│   │   ├── token.go   # JWT operations (verify, refresh, logout)
│   │   └── password.go # Password reset
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── main.go        # Application entry point
├── Dockerfile
├── go.mod
└── test.sh
```

## 🚀 Features

### Authentication
- ✅ User Registration with validation
- ✅ User Login (username/email + password)
- ✅ JWT Token Generation (Access + Refresh tokens)
- ✅ Token Verification
- ✅ Token Refresh
- ✅ Secure Logout with Redis blacklisting

### Password Management
- ✅ Password Reset Request
- ✅ Password Reset Confirmation
- ✅ Secure password hashing (bcrypt)

### Security
- ✅ JWT with HMAC-SHA256 signing
- ✅ Redis-based token blacklisting
- ✅ Password strength validation
- ✅ Rate limiting protection
- ✅ SQL injection protection (GORM)

## 🔌 API Endpoints

### Base URL: `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | ❌ |
| POST | `/login` | User login | ❌ |
| POST | `/logout` | User logout | ✅ |
| POST | `/refresh` | Refresh access token | ❌ |
| GET | `/verify` | Verify token validity | ✅ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/reset-password` | Reset password | ❌ |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health status |

## 📝 API Documentation

### Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "birth_date": "1990-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "login": "john_doe", // username or email
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

### Token Verification
```http
GET /api/v1/auth/verify
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "user_id": "uuid"
  }
}
```

### Token Refresh
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "logged out successfully"
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | localhost | ✅ |
| `DB_PORT` | PostgreSQL port | 5432 | ❌ |
| `DB_USER` | PostgreSQL username | postgres | ❌ |
| `DB_PASSWORD` | PostgreSQL password | password | ✅ |
| `DB_NAME` | Database name | matcha | ✅ |
| `REDIS_HOST` | Redis host | localhost | ❌ |
| `REDIS_PORT` | Redis port | 6379 | ❌ |
| `REDIS_PASSWORD` | Redis password | - | ❌ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_REFRESH_SECRET` | JWT refresh secret | JWT_SECRET | ❌ |
| `JWT_ACCESS_TTL` | Access token TTL | 15m | ❌ |
| `JWT_REFRESH_TTL` | Refresh token TTL | 7d | ❌ |
| `AUTO_MIGRATE` | Run DB migrations | false | ❌ |

### Database Models

The service manages these database tables:
- `users` - User accounts
- `tags` - User interest tags
- `user_tags` - User-tag relationships
- `images` - User profile images
- `relations` - User relationships (likes, blocks)
- `discussions` - Chat conversations
- `messages` - Chat messages

## 🧪 Testing

```bash
# Run all tests
./test.sh

# Run specific tests
go test -v ./src -run TestRegister
go test -v ./src -run TestLogin
go test -v ./src -run TestToken
```

**Test Coverage:** 56.7%

### Test Categories
- ✅ Registration handlers
- ✅ Login handlers  
- ✅ Token operations (verify, refresh, logout)
- ✅ Password reset
- ✅ Health checks

## 🔒 Security Features

### JWT Security
- HMAC-SHA256 signing algorithm
- Short-lived access tokens (15min default)
- Long-lived refresh tokens (7 days default)
- Token scope validation (access vs refresh)

### Redis Blacklisting
- Immediate token invalidation on logout
- TTL-based automatic cleanup
- Fallback graceful handling if Redis unavailable

### Password Security
- bcrypt hashing with salt rounds
- Password strength validation
- Secure password reset flow

## 🐳 Docker

```bash
# Build development image
docker build -t auth-service:dev .

# Run with environment variables
docker run -e JWT_SECRET=your-secret \
          -e DB_PASSWORD=password \
          -p 8001:8001 \
          auth-service:dev
```

## 📊 Monitoring

### Health Endpoint
```http
GET /health
```

### Logs
The service logs important events:
- Database connection status
- Redis connection status
- Authentication attempts
- Token operations
- Error conditions

## 🔄 Development

### Project Structure
```
src/
├── conf/           # Configuration & connections
├── handlers/       # HTTP request handlers
├── models/         # Database models (GORM)
├── services/       # Business logic layer
├── utils/          # Helper functions
└── main.go        # Application bootstrap
```

### Adding New Features
1. Define models in `models/`
2. Implement business logic in `services/`
3. Create HTTP handlers in `handlers/`
4. Register routes in `main.go`
5. Add tests in `*_test.go` files

## 🚨 Error Handling

The service returns consistent error responses:

```json
{
  "success": false,
  "error": "error_message",
  "code": "ERROR_CODE"
}
```

Common error codes:
- `INVALID_CREDENTIALS` - Wrong username/password
- `TOKEN_EXPIRED` - JWT token expired
- `TOKEN_INVALID` - Malformed or invalid token
- `USER_EXISTS` - User already registered
- `VALIDATION_ERROR` - Input validation failed

## 📈 Performance

- Supports horizontal scaling
- Redis caching for token blacklisting
- Connection pooling for database
- Optimized JWT operations
- Graceful degradation if Redis unavailable
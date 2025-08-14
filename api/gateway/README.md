# Gateway Documentation

## 📋 Overview

The Gateway is the central entry point for all API requests in the Matcha application. It acts as a reverse proxy, API gateway, and authentication middleware, providing centralized JWT validation, CORS handling, and load balancing across microservices.

## 🏗️ Architecture

```
gateway/
├── src/
│   ├── handlers/       # HTTP handlers
│   │   ├── health.go   # Health check endpoints
│   │   └── cors.go     # CORS middleware
│   ├── middleware/     # Request middleware
│   │   └── jwt.go      # JWT authentication
│   ├── proxy/          # Reverse proxy logic
│   │   └── proxy.go    # Request forwarding
│   ├── redis/          # Redis integration
│   │   └── blacklist.go # JWT blacklisting
│   ├── routes/         # Route definitions
│   │   ├── auth.go     # Auth service routes
│   │   ├── user.go     # User service routes
│   │   ├── media.go    # Media service routes
│   │   ├── match.go    # Match service routes
│   │   ├── chat.go     # Chat service routes
│   │   └── notify.go   # Notification routes
│   ├── utils/          # Utility functions
│   └── main.go         # Application entry point
├── Dockerfile
└── go.mod
```

## 🚀 Features

### API Gateway Capabilities
- ✅ Reverse proxy to microservices
- ✅ Load balancing and service discovery
- ✅ Request/response transformation
- ✅ Centralized logging and monitoring
- ✅ Health check aggregation

### Authentication & Authorization
- ✅ JWT token validation
- ✅ Redis-based token blacklisting
- ✅ User context propagation
- ✅ Route-based authentication
- ✅ Token forwarding to services

### Cross-Cutting Concerns
- ✅ CORS handling for web clients
- ✅ Request timeout management
- ✅ Error handling and normalization
- ✅ Request/response logging
- ✅ Graceful error fallback

## 🔌 API Routes

### Authentication Routes (No JWT Required)
| Method | Endpoint | Upstream Service | Description |
|--------|----------|------------------|-------------|
| POST | `/api/v1/auth/register` | auth-service:8001 | User registration |
| POST | `/api/v1/auth/login` | auth-service:8001 | User login |
| POST | `/api/v1/auth/refresh` | auth-service:8001 | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | auth-service:8001 | Password reset request |
| POST | `/api/v1/auth/reset-password` | auth-service:8001 | Password reset confirmation |

### Protected Routes (JWT Required)
| Method | Endpoint | Upstream Service | Description |
|--------|----------|------------------|-------------|
| POST | `/api/v1/auth/logout` | auth-service:8001 | User logout |
| GET | `/api/v1/auth/verify` | auth-service:8001 | Verify token |
| GET | `/api/users/profile/:id` | user-service:8002 | Get user profile |
| PUT | `/api/users/profile/:id` | user-service:8002 | Update user profile |
| DELETE | `/api/users/profile/:id` | user-service:8002 | Delete user profile |
| GET | `/api/users/search` | user-service:8002 | Search users |
| POST | `/api/users/upload-photo` | user-service:8002 | Upload profile photo |
| POST | `/api/media/upload` | media-service:8006 | Upload media file |
| GET | `/api/media/:id` | media-service:8006 | Get media file |
| DELETE | `/api/media/:id` | media-service:8006 | Delete media file |
| GET | `/api/matches/list` | match-service:8003 | Get matches |
| POST | `/api/matches/like/:userId` | match-service:8003 | Like user |
| POST | `/api/matches/pass/:userId` | match-service:8003 | Pass user |
| GET | `/api/chat/conversations` | chat-service:8004 | Get conversations |
| POST | `/api/chat/conversations/:id/messages` | chat-service:8004 | Send message |
| GET | `/api/notifications/list` | notify-service:8005 | Get notifications |
| PUT | `/api/notifications/:id/read` | notify-service:8005 | Mark as read |

### Health Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Gateway health status |
| GET | `/api/health` | Gateway health status |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Gateway server port | 8080 | ❌ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_REFRESH_SECRET` | JWT refresh secret | JWT_SECRET | ❌ |
| `REDIS_ADDR` | Redis address | redis:6379 | ❌ |
| `REDIS_PASSWORD` | Redis password | - | ❌ |
| `GIN_MODE` | Gin mode (debug/release) | release | ❌ |

### Service Configuration

The gateway automatically configures upstream services:

```go
services = map[string]ServiceConfig{
    "auth": {
        Name: "auth-service",
        URL:  "http://auth-service:8001",
    },
    "user": {
        Name: "user-service", 
        URL:  "http://user-service:8002",
    },
    // ... other services
}
```

## 🔒 Security Features

### JWT Authentication Flow

1. **Token Extraction**: From `Authorization: Bearer <token>` header or `access_token` cookie
2. **Token Validation**: HMAC-SHA256 signature verification
3. **Blacklist Check**: Redis lookup for revoked tokens
4. **Claims Extraction**: User ID and token metadata
5. **Context Propagation**: `X-User-ID` and `X-JWT-Token` headers to upstream services

### CORS Configuration

```go
// Dynamic CORS based on Origin header
if origin != "" {
    // Echo caller origin and allow credentials
    "Access-Control-Allow-Origin": origin
    "Access-Control-Allow-Credentials": "true"
} else {
    // Wildcard for non-browser requests
    "Access-Control-Allow-Origin": "*"
    "Access-Control-Allow-Credentials": "false"
}
```

### Redis Blacklisting

- **Token Hashing**: SHA256 hash of tokens as Redis keys
- **TTL Management**: Expiration matches token expiration
- **Graceful Fallback**: Allow requests if Redis unavailable
- **Performance**: 2-second timeout for Redis operations

## 🚦 Request Flow

### Authenticated Request Flow

```
Client Request
    ↓
CORS Middleware
    ↓
JWT Middleware
    ↓
Redis Blacklist Check
    ↓
JWT Validation
    ↓
User Context Setting
    ↓
Route Handler
    ↓
Service Discovery
    ↓
Request Transformation
    ↓
Upstream Service Call
    ↓
Response Transformation
    ↓
Client Response
```

### Headers Propagation

**To Upstream Services:**
- `X-User-ID`: Extracted from JWT `sub` claim
- `X-JWT-Token`: Original JWT token
- All original request headers (except `Host`)

**From Upstream Services:**
- All response headers preserved
- Multiple `Set-Cookie` headers supported
- Content-Type and custom headers forwarded

## 🧪 Testing

### Running Tests

```bash
# Run all tests
cd api/gateway/src
go test -v .

# Run specific test categories
go test -v . -run TestJWT
go test -v . -run TestProxy
go test -v . -run TestCORS

# Run with coverage
go test -cover .
```

### Test Categories

**JWT Middleware Tests:**
- Token validation and rejection
- Blacklist integration
- Context setting
- Error handling

**Proxy Tests:**
- Header forwarding
- Path parameter replacement  
- Query parameter preservation
- Response copying

**CORS Tests:**
- Origin-based CORS policies
- Preflight request handling
- Credential policies

### Test Environment Setup

```go
// Test JWT token generation
func signTestToken(sub string, secret string) (string, error) {
    claims := jwt.MapClaims{
        "sub": sub,
        "exp": time.Now().Add(1 * time.Hour).Unix(),
        "iat": time.Now().Add(-1 * time.Minute).Unix(),
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}
```

## 📊 Monitoring & Observability

### Health Checks

The gateway provides comprehensive health information:

```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "services": {
    "auth": "http://auth-service:8001",
    "user": "http://user-service:8002",
    "media": "http://media-service:8006",
    "match": "http://match-service:8003",
    "chat": "http://chat-service:8004",
    "notify": "http://notify-service:8005"
  }
}
```

### Request Logging

Built-in Gin logging middleware provides:
- Request method and path
- Response status code
- Response time
- Client IP address
- Request size

### Error Handling

Standardized error responses:

```json
{
  "error": "Service user-service unavailable",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/users/profile/123"
}
```

## 🚀 Performance

### Optimizations

- **Connection Pooling**: HTTP client reuse
- **Timeout Management**: 30-second upstream timeouts
- **Redis Caching**: Token blacklist with 2-second timeout
- **Memory Efficiency**: Request body streaming
- **Concurrent Processing**: Goroutine-based request handling

### Scaling Considerations

- **Stateless Design**: No session storage
- **Redis Dependency**: Shared blacklist across instances
- **Service Discovery**: Static configuration for container networking
- **Load Balancing**: External load balancer recommended

## 🔄 Development

### Adding New Service Routes

1. **Service Configuration**: Add to `initServices()` function
2. **Route Setup**: Create `setup<Service>Routes()` function
3. **Middleware**: Apply `jwtMiddleware()` for protected routes
4. **Path Mapping**: Map gateway paths to upstream paths
5. **Testing**: Add route-specific tests

### Custom Middleware

```go
func customMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Pre-processing
        c.Next()
        // Post-processing
    }
}
```

### Service Health Integration

Future enhancement: Active health checking of upstream services with circuit breaker pattern.

## 🚨 Error Scenarios

### Common Issues

**JWT Secret Missing:**
- Gateway logs: "JWT_SECRET is not set"
- Response: All protected routes return 401

**Redis Connection Failed:**
- Gateway logs: "Failed to initialize Redis"
- Behavior: Token blacklisting disabled, requests proceed

**Upstream Service Unavailable:**
- Response: 502 Bad Gateway
- Retry: No automatic retry (implement in future)

**Token Expired/Invalid:**
- Response: 401 Unauthorized
- Body: `{"error": "token expired"}` or `{"error": "invalid token"}`

### Debugging Tools

```bash
# Check gateway logs
docker logs matcha-gateway-1

# Test JWT manually
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/users/profile/1

# Check Redis blacklist
docker exec matcha-redis-1 redis-cli keys "blacklist:*"
```

## 📈 Metrics & Analytics

### Key Metrics to Monitor

- **Request Rate**: Requests per second by endpoint
- **Response Time**: P95/P99 latencies by service
- **Error Rate**: 4xx/5xx responses by endpoint
- **Authentication**: JWT validation success/failure rates
- **Redis Performance**: Blacklist check latencies
- **Upstream Health**: Service availability and response times
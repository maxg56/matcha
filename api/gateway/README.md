# Gateway Documentation

## 📋 Overview

The Gateway is the **central entry point** for all API requests in the Matcha application. It acts as a **reverse proxy, API gateway, and authentication middleware**, providing centralized JWT validation, CORS handling, WebSocket management, and load balancing across microservices.

## 🏗️ Architecture

```
gateway/
├── src/
│   ├── config/          # Environment configuration
│   │   └── env.go       # Configuration validation
│   ├── handlers/        # HTTP handlers
│   │   ├── health.go    # Health check endpoints
│   │   └── cors.go      # Secure CORS middleware
│   ├── middleware/      # Request middleware
│   │   ├── jwt.go       # JWT authentication
│   │   └── ratelimit.go # Rate limiting protection
│   ├── proxy/           # Reverse proxy logic
│   │   └── proxy.go     # HTTP/WebSocket forwarding
│   ├── routes/          # Route definitions
│   │   ├── auth.go      # Auth service routes
│   │   ├── user.go      # User service routes
│   │   ├── media.go     # Media service routes
│   │   ├── match.go     # Match service routes
│   │   ├── chat.go      # Chat service routes
│   │   ├── notify.go    # Notification routes
│   │   └── websocket.go # WebSocket unified route
│   ├── services/        # Service discovery
│   │   └── config.go    # Service configuration
│   ├── utils/           # Utility functions
│   │   ├── blacklist.go # Redis JWT blacklisting
│   │   └── token.go     # JWT utilities
│   ├── websocket/       # WebSocket management
│   │   ├── manager.go   # Connection manager
│   │   ├── client.go    # Client representation
│   │   ├── handlers.go  # Message routing
│   │   ├── services.go  # Service integration
│   │   ├── security.go  # Origin validation
│   │   ├── logger.go    # Structured logging
│   │   └── types.go     # WebSocket types
│   └── main.go          # Application entry point
├── Dockerfile
└── go.mod
```

## 🚀 Features

### API Gateway Capabilities
- ✅ Reverse proxy to microservices
- ✅ **WebSocket unified management**
- ✅ Load balancing and service discovery
- ✅ Request/response transformation
- ✅ **Rate limiting protection**
- ✅ Centralized logging and monitoring
- ✅ Health check aggregation

### Authentication & Security
- ✅ JWT token validation with leeway
- ✅ Redis-based token blacklisting
- ✅ **Secure origin validation**
- ✅ User context propagation
- ✅ Route-based authentication
- ✅ **Production-ready CORS**
- ✅ Token forwarding to services

### WebSocket Features
- ✅ **Unified WebSocket endpoint** (`/ws`)
- ✅ **Message type routing** (chat, notifications, subscriptions)
- ✅ **Real-time chat broadcasting**
- ✅ **Service integration** (chat/notification services)
- ✅ **Connection management** with cleanup
- ✅ **Secure origin checking**
- ✅ **JWT authentication** for WebSocket

### Cross-Cutting Concerns
- ✅ **Environment validation**
- ✅ **Structured logging system**
- ✅ **Rate limiting** (token bucket)
- ✅ Request timeout management
- ✅ Error handling and normalization
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

### WebSocket Routes (JWT Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| WS | `/ws` | **Unified WebSocket connection** |

### Health Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Gateway health status |
| GET | `/api/health` | Gateway health status |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| **Core Configuration** |
| `PORT` | Gateway server port | 8080 | ❌ |
| `ENVIRONMENT` | Environment (development/production) | development | ❌ |
| **Security** |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | localhost:3000,127.0.0.1:3000 | ❌ |
| **Redis** |
| `REDIS_ADDR` | Redis address | localhost:6379 | ❌ |
| `REDIS_PASSWORD` | Redis password | - | ❌ |
| **Timeouts** |
| `HTTP_TIMEOUT` | HTTP client timeout | 30s | ❌ |
| `REDIS_TIMEOUT` | Redis operation timeout | 5s | ❌ |
| **Rate Limiting** |
| `RATE_LIMIT_ENABLED` | Enable rate limiting | true | ❌ |
| `RATE_LIMIT_RPS` | Requests per second per IP | 100 | ❌ |
| **Logging** |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | info | ❌ |

### Production Environment Example

```bash
# .env.production
ENVIRONMENT=production
JWT_SECRET=your-super-secure-32-char-secret-key-here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RATE_LIMIT_ENABLED=true
RATE_LIMIT_RPS=50
LOG_LEVEL=warn
HTTP_TIMEOUT=10s
REDIS_TIMEOUT=3s
```

### Development Environment Example

```bash
# .env.development
ENVIRONMENT=development
JWT_SECRET=dev-secret-min-32-chars-here-for-testing
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000
RATE_LIMIT_ENABLED=true
RATE_LIMIT_RPS=200
LOG_LEVEL=debug
```

## 🔒 Security Features

### JWT Authentication Flow

1. **Token Extraction**: From `Authorization: Bearer <token>` header or `access_token` cookie
2. **Token Validation**: HMAC-SHA256 signature verification with time leeway
3. **Blacklist Check**: Redis lookup for revoked tokens (2s timeout)
4. **Claims Extraction**: User ID and token metadata
5. **Context Propagation**: `X-User-ID` and `X-JWT-Token` headers to upstream services

### Secure CORS Configuration

```go
// ✅ Production-ready CORS
if origin != "" && isOriginAllowedCORS(origin) {
    c.Header("Access-Control-Allow-Origin", origin)
    c.Header("Access-Control-Allow-Credentials", "true")
} else if origin == "" {
    c.Header("Access-Control-Allow-Origin", "*")
    c.Header("Access-Control-Allow-Credentials", "false")
} else {
    // ✅ Reject unauthorized origins
    c.Header("Access-Control-Allow-Origin", "null")
}
```

### WebSocket Security

```go
// ✅ Secure origin validation
CheckOrigin: func(r *http.Request) bool {
    origin := r.Header.Get("Origin")
    return isOriginAllowed(origin) // Validates against ALLOWED_ORIGINS
}
```

### Rate Limiting

- **Algorithm**: Token bucket per IP address
- **Default**: 100 RPS per client
- **Cleanup**: Automatic removal of old limiters (10min)
- **Response**: `429 Too Many Requests` when exceeded

## 🔌 WebSocket Protocol

### Connection

```javascript
// ✅ Authenticated WebSocket connection
const ws = new WebSocket('ws://gateway:8080/ws', [], {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Message Format

```javascript
// Standard message format
{
  "type": "chat|notification|subscribe|unsubscribe|ping",
  "data": { ... },
  "to": "optional_target",
  "from": "optional_sender"
}
```

### Chat Messages

```javascript
// Send chat message
ws.send(JSON.stringify({
  type: 'chat',
  data: {
    conversation_id: '123',
    message: 'Hello world!'
  }
}));

// Receive chat message
{
  "type": "chat_message",
  "data": {
    "conversation_id": "123",
    "message": "Hello world!",
    "from_user": "user456",
    "timestamp": 1640995200,
    "type": "chat_message"
  }
}

// Chat acknowledgment
{
  "type": "chat_ack",
  "data": {
    "status": "sent",
    "timestamp": 1640995200,
    "conversation_id": "123"
  }
}
```

### Subscription Management

```javascript
// Subscribe to notifications
ws.send(JSON.stringify({
  type: 'subscribe',
  data: 'notifications'
}));

// Subscribe to chat conversation
ws.send(JSON.stringify({
  type: 'subscribe',
  data: 'chat_123'
}));

// Unsubscribe
ws.send(JSON.stringify({
  type: 'unsubscribe',
  data: 'notifications'
}));
```

### Notification Handling

```javascript
// Mark notification as read
ws.send(JSON.stringify({
  type: 'notification',
  data: {
    action: 'mark_read',
    notification_id: '456'
  }
}));

// Mark all notifications as read
ws.send(JSON.stringify({
  type: 'notification',
  data: {
    action: 'mark_all_read'
  }
}));
```

### Error Handling

```javascript
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.type === 'error') {
    console.error('WebSocket error:', msg.data);
    // Handle: access_denied, invalid_data, service_error, etc.
  }
};
```

## 🚦 Request Flow

### HTTP Request Flow

```
Client Request
    ↓
Rate Limiting
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

### WebSocket Flow

```
WebSocket Upgrade
    ↓
Origin Validation (CORS)
    ↓
JWT Middleware
    ↓
Connection Registration
    ↓
Message Type Routing
    ↓
┌─────────────────────────────────┐
│ Service Integration             │
│ ├─ Chat: Access validation      │
│ ├─ Chat: Message persistence    │
│ ├─ Notification: Mark as read   │
│ └─ Real-time: Broadcasting      │
└─────────────────────────────────┘
    ↓
Client Response/Broadcast
```

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
go test -v . -run TestWebSocket

# Run with coverage
go test -cover .
```

### WebSocket Testing

```javascript
// Basic WebSocket test
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080/ws', {
  headers: {
    'Authorization': 'Bearer ' + validToken
  }
});

ws.on('open', () => {
  // Test chat message
  ws.send(JSON.stringify({
    type: 'chat',
    data: {
      conversation_id: 'test123',
      message: 'Test message'
    }
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('Received:', msg);
});
```

## 📊 Monitoring & Observability

### Structured Logging

The gateway provides comprehensive structured logging:

```json
{
  "level": "INFO",
  "component": "websocket",
  "user": "user123",
  "operation": "chat_message",
  "details": {
    "conversation": "conv456",
    "message_length": 25
  },
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Health Check Response

```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z",
  "configuration": {
    "environment": "production",
    "rate_limiting": true,
    "websocket_enabled": true
  },
  "services": {
    "auth": {
      "name": "auth-service",
      "url": "http://auth-service:8001",
      "websocket": false
    },
    "chat": {
      "name": "chat-service", 
      "url": "http://chat-service:8004",
      "websocket": true
    },
    "notify": {
      "name": "notify-service",
      "url": "http://notify-service:8005", 
      "websocket": true
    }
  },
  "metrics": {
    "active_websocket_connections": 42,
    "rate_limit_stats": {
      "enabled": true,
      "max_tokens": 100,
      "active_clients": 15
    }
  }
}
```

## 🚀 Performance

### Optimizations

- **Connection Pooling**: HTTP client reuse with configurable timeouts
- **WebSocket Management**: Efficient connection pooling with automatic cleanup
- **Rate Limiting**: Token bucket algorithm with memory-efficient cleanup
- **Redis Caching**: Token blacklist with configurable timeout (3-5s)
- **Async Processing**: Chat message persistence doesn't block real-time broadcast
- **Concurrent Processing**: Goroutine-based request handling

### WebSocket Performance

- **Connection Limit**: Managed by system resources
- **Message Broadcasting**: Efficient channel-based routing
- **Memory Management**: Automatic cleanup of stale connections (5min)
- **Service Calls**: Async persistence, sync validation for security

## 🚨 Error Scenarios & Troubleshooting

### Configuration Errors

**JWT Secret Missing (Production):**
```bash
FATAL: Required environment variable JWT_SECRET is not set
```

**Invalid Origins:**
```bash
FATAL: Empty origin found in ALLOWED_ORIGINS
```

### Runtime Errors

**WebSocket Connection Rejected:**
```json
{
  "error": "WebSocket upgrade failed: origin not allowed",
  "origin": "https://malicious-site.com"
}
```

**Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**Service Integration Errors:**
```json
{
  "type": "error",
  "data": {
    "error_type": "notification_service_error",
    "message": "Failed to mark notification as read: service unavailable"
  }
}
```

### Debugging Commands

```bash
# Check gateway logs
docker logs matcha-gateway-1 -f

# Test WebSocket connection
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Origin: http://localhost:3000" \
     -H "Authorization: Bearer <token>" \
     http://localhost:8080/ws

# Check Redis blacklist
docker exec matcha-redis-1 redis-cli keys "blacklist:*"

# Monitor rate limiting
curl http://localhost:8080/health | jq .metrics.rate_limit_stats
```

## 📈 Metrics & Analytics

### Key Metrics to Monitor

**HTTP Metrics:**
- Request rate by endpoint
- Response time P95/P99 by service  
- Error rate (4xx/5xx) by endpoint
- Authentication success/failure rates

**WebSocket Metrics:**
- Active connection count
- Message throughput by type
- Connection duration distribution
- Origin validation success/failure

**Security Metrics:**
- Rate limiting triggers
- Invalid origin attempts
- JWT validation failures
- Blacklist hit rates

**Service Integration:**
- Chat service response times
- Notification service availability
- Message persistence success rates

## 🔄 Development

### Adding New Services

1. **Service Configuration** (`services/config.go`):
```go
"newservice": {
    Name: "new-service",
    URL:  "http://new-service:8007",
    WebSocket: false, // or true for WebSocket support
},
```

2. **Route Setup** (`routes/newservice.go`):
```go
func SetupNewServiceRoutes(r *gin.Engine) {
    service := r.Group("/api/v1/newservice")
    service.Use(middleware.JWTMiddleware())
    {
        service.GET("/data", proxy.ProxyRequest("newservice", "/api/v1/data"))
    }
}
```

3. **Register in Main** (`main.go`):
```go
routes.SetupNewServiceRoutes(r)
```

### WebSocket Message Types

To add new WebSocket message types:

1. **Add Type Constant** (`websocket/types.go`):
```go
const (
    MessageTypeNewFeature MessageType = "new_feature"
)
```

2. **Add Handler** (`websocket/handlers.go`):
```go
case MessageTypeNewFeature:
    HandleNewFeatureMessage(msg, userID, token)
```

3. **Implement Handler**:
```go
func HandleNewFeatureMessage(msg Message, userID, token string) {
    // Implementation
}
```

## 🔐 Security Best Practices

### Production Checklist

- ✅ **JWT_SECRET**: 32+ characters, cryptographically random
- ✅ **ALLOWED_ORIGINS**: Specific domains only, no wildcards
- ✅ **HTTPS**: Use wss:// for WebSocket in production
- ✅ **Rate Limiting**: Enable and tune for your traffic
- ✅ **Logging**: Set to 'warn' or 'error' level
- ✅ **Timeouts**: Configure appropriate timeouts for your services
- ✅ **Redis**: Secure Redis connection with password
- ✅ **CORS**: Validate all allowed origins are legitimate
- ✅ **Monitoring**: Set up alerts for security metrics

### Security Headers

The gateway automatically sets security-appropriate headers:

```http
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Origin,Content-Type,Accept,Authorization
Vary: Origin
```

---

## 📚 Additional Resources

- **JWT Best Practices**: [RFC 8725](https://tools.ietf.org/rfc/rfc8725.txt)
- **WebSocket Security**: [RFC 6455 Security Considerations](https://tools.ietf.org/rfc/rfc6455.html#section-10)
- **Rate Limiting**: [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- **CORS Specification**: [W3C CORS](https://www.w3.org/TR/cors/)

**Production-Ready Gateway with Security, Performance, and Observability Built-in** 🚀
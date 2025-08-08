# Matcha - Dating Application

A microservices-based dating application built with Go, Python, and React.

## Services Architecture

| Service | Language | Port | Description |
|---------|----------|------|-------------|
| **gateway** | Go | 8080 | API Gateway and reverse proxy |
| **auth-service** | Go | 8001 | Authentication and authorization |
| **user-service** | Go | 8002 | User profiles and management |
| **match-service** | Python | 8003 | Matching algorithm and logic |
| **chat-service** | Go | 8004 | Real-time messaging and WebSocket |
| **notify-service** | Python | 8005 | Push notifications and alerts |
| **media-service** | Python | 8006 | Image upload and processing |
| **frontend** | React | 3000 | Web application frontend |

## Prerequisites

- Docker and Docker Compose
- Go 1.21+ (for local development)
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd matcha
```

2. Start all services with Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- Individual services: http://localhost:800[1-6]

## Development

### Go Services (gateway, auth-service, user-service, chat-service)

```bash
cd api/<service-name>
go mod tidy
go run main.go
```

### Python Services (match-service, notify-service, media-service)

```bash
cd api/<service-name>
pip install -r requirements.txt
python main.py
```

### Frontend (React)

```bash
cd frontend
npm install
npm start
```

## Database

The application uses PostgreSQL as the primary database and Redis for caching and sessions.

- PostgreSQL: localhost:5432
- Redis: localhost:6379

## API Endpoints

### Auth Service (Port 8001)
- POST `/api/v1/auth/register` - User registration
- POST `/api/v1/auth/login` - User login
- POST `/api/v1/auth/logout` - User logout
- POST `/api/v1/auth/refresh` - Refresh access token
- GET `/api/v1/auth/verify` - Verify access token

### User Service (Port 8002)
- GET `/api/v1/users/profile/:id` - Get user profile
- PUT `/api/v1/users/profile/:id` - Update user profile
- DELETE `/api/v1/users/profile/:id` - Delete user profile
- GET `/api/v1/users/search` - Search users
- POST `/api/v1/users/upload-photo` - Upload profile photo

### Match Service (Port 8003)
- GET `/api/v1/matches` - Get potential matches
- POST `/api/v1/matches/like` - Like a user
- POST `/api/v1/matches/unlike` - Unlike a user
- POST `/api/v1/matches/block` - Block a user
- GET `/api/v1/matches/algorithm` - Get matching algorithm results

### Chat Service (Port 8004)
- GET `/api/v1/chat/ws` - WebSocket connection
- GET `/api/v1/chat/conversations/:userID` - Get conversations
- GET `/api/v1/chat/messages/:conversationID` - Get messages
- POST `/api/v1/chat/messages` - Send message

### Notification Service (Port 8005)
- GET `/api/v1/notifications` - Get notifications
- POST `/api/v1/notifications/send` - Send notification
- PUT `/api/v1/notifications/mark-read` - Mark as read
- GET/PUT `/api/v1/notifications/settings` - Notification settings

### Media Service (Port 8006)
- POST `/api/v1/media/upload` - Upload file
- GET `/api/v1/media/get/:filename` - Get file
- DELETE `/api/v1/media/delete/:filename` - Delete file
- POST `/api/v1/media/resize` - Resize image

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=matcha
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# Services
AUTH_SERVICE_URL=http://localhost:8001
USER_SERVICE_URL=http://localhost:8002
MATCH_SERVICE_URL=http://localhost:8003
CHAT_SERVICE_URL=http://localhost:8004
NOTIFY_SERVICE_URL=http://localhost:8005
MEDIA_SERVICE_URL=http://localhost:8006
```

## Testing

Each service can be tested individually:

```bash
# Go services
cd api/<service-name>
go test ./...

# Python services
cd api/<service-name>
pytest

# Frontend
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
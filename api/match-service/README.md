# Match Service 🎯

Advanced vector-based matching service for the Matcha dating application implemented in Go with Gin framework, featuring algorithm-based matching and user interaction tracking.

## 🚀 Features

### Vector-Based Matching Algorithm
- **User Representation**: Multi-dimensional vectors encoding user attributes (age, lifestyle, preferences, location)
- **Similarity Calculations**: Cosine similarity, weighted distance, and haversine distance for geographic matching
- **Dynamic Learning**: Preference vectors that adapt based on user interactions (reinforcement learning inspired)
- **Compatibility Scoring**: Advanced scoring system with distance penalties, age factors, and freshness boosts

### Advanced Filtering & Ranking
- Sexual orientation compatibility
- Geographic distance filtering
- Age range constraints  
- Interaction history exclusion
- Randomness injection for variety
- Profile freshness prioritization

### High-Performance Architecture
- **Caching Layer**: Redis-based caching for compatibility scores, user vectors, and algorithm results
- **Rate Limiting**: Configurable rate limiting per user and IP
- **Comprehensive Logging**: Structured logging with performance monitoring
- **Security**: JWT validation, input sanitization, and attack pattern detection

## 📁 Project Structure

```
src/
├── conf/                  # Database and configuration
│   ├── db.go             # Database connection setup
│   └── ...
├── handlers/             # HTTP request handlers
│   ├── matches.go        # Match-related endpoints
│   ├── matrix.go         # Matrix data endpoints
│   └── ...
├── middleware/           # HTTP middleware
│   ├── auth.go           # JWT authentication middleware
│   └── ...
├── models/              # GORM database models
│   ├── user_interaction.go  # User interactions model
│   └── ...
├── services/            # Business logic layer
│   ├── vector_matching_service.go  # Core matching algorithm
│   ├── match_service.go            # High-level matching interface
│   └── ...
├── types/               # Custom types and enums
├── utils/               # Utility functions
└── main.go              # Application entry point
```

## 🔧 Installation & Setup

### Prerequisites
- Go 1.19+
- PostgreSQL 12+
- Git

### Installation
```bash
# Navigate to match-service
cd api/match-service

# Install Go dependencies
go mod tidy

# Build the service
cd src
go build -o match-service main.go

# Run the service
./match-service
# OR run directly with:
go run main.go
```

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=matcha_dev
DB_USER=postgres
DB_PASSWORD=password

```

## 🎯 API Endpoints

### Matching Endpoints
```bash
# Get mutual matches
GET /api/v1/matches
Headers: X-User-ID: 123

# Like a user
POST /api/v1/matches/like
Headers: X-User-ID: 123
Body: {"target_user_id": 456}

# Pass on a user  
POST /api/v1/matches/unlike
Headers: X-User-ID: 123
Body: {"target_user_id": 456}

# Block a user
POST /api/v1/matches/block
Headers: X-User-ID: 123
Body: {"target_user_id": 456}
```

### Algorithm Endpoint
```bash
# Run enhanced vector matching algorithm
GET /api/v1/matches/algorithm?limit=20&max_distance=50&age_min=25&age_max=35&algorithm_type=vector_based
Headers: X-User-ID: 123

# Response includes compatibility scores, distances, and algorithm metadata
```

### Preference Learning Endpoint
```bash
# Get learned user preferences
GET /api/v1/matches/preferences
Headers: X-User-ID: 123

# Returns user's preference vector, learning metadata, and algorithm parameters
```

### Matrix Data Endpoints
```bash
# Get users as numerical matrix
GET /api/v1/matrix/users?user_ids=1,2,3&include_metadata=true

# Get compatible users matrix
GET /api/v1/matrix/compatible/123

# Export matrix to file
POST /api/v1/matrix/export
Body: {"user_ids": [1,2,3], "filename": "my_matrix.json"}
```

## 🔍 Implementation Details

### Enhanced Vector Matching System

#### Multi-dimensional User Vectors
Users are represented as 17-dimensional normalized vectors:
```go
type UserVector struct {
    Age                 float64   // Normalized 0-1 (18-80 years)
    Height              float64   // Normalized 0-1 (140-220cm) 
    Fame                float64   // Normalized 0-1 (0-100 points)
    AlcoholConsumption  float64   // Encoded lifestyle attribute
    Smoking             float64   // Encoded lifestyle attribute
    Cannabis            float64   // Encoded lifestyle attribute
    Drugs               float64   // Encoded lifestyle attribute
    Pets                float64   // Encoded lifestyle attribute
    SocialActivityLevel float64   // Encoded lifestyle attribute
    SportActivity       float64   // Encoded lifestyle attribute
    EducationLevel      float64   // Encoded lifestyle attribute
    Religion            float64   // Encoded lifestyle attribute
    ChildrenStatus      float64   // Encoded lifestyle attribute
    PoliticalView       float64   // Encoded lifestyle attribute
    Latitude            float64   // Normalized coordinates
    Longitude           float64   // Normalized coordinates
}
```

#### Preference Learning Algorithm
- **Positive Interactions (Likes)**: Preference vector moves closer to target user's vector
- **Negative Interactions (Pass)**: Preference vector moves away from target user's vector
- **Learning Rate**: Configurable (default 0.1) for gradual preference adaptation
- **Persistent Storage**: User preferences saved to `user_preferences` table

#### Advanced Compatibility Scoring
```go
finalScore = baseSimilarity * distancePenalty * ageCompatibilityFactor * 
             fameBoost * freshnessBoost * randomFactor
```

**Factors:**
- **Base Similarity**: Weighted cosine similarity between preference and candidate vectors
- **Distance Penalty**: Geographic distance impact (closer users scored higher)
- **Age Compatibility**: Penalty for age differences beyond threshold
- **Fame Boost**: Small bonus for higher fame users
- **Freshness Boost**: Bonus for recently updated profiles
- **Random Factor**: Prevents identical rankings, adds variety

#### Database Models
- **User Interactions**: GORM models for tracking likes, unlikes, and blocks
- **User Preferences**: Learned preference vectors with update tracking
- **Vector Storage**: Normalized user attributes and learned preferences
- **Match Tracking**: Bidirectional relationship management

### Service Architecture
- **Handlers**: HTTP request/response handling with Gin
- **Vector Utils**: Mathematical functions for similarity calculations
- **Services**: Business logic for enhanced matching algorithms
- **Models**: GORM database models and relationships
- **Middleware**: JWT authentication and request validation

### Performance Optimizations
- **Database Indexing**: Optimized PostgreSQL queries with proper indexes
- **Vector Calculations**: Efficient mathematical operations
- **Goroutines**: Concurrent request processing
- **GORM**: Efficient ORM with connection pooling
- **Candidate Filtering**: Pre-filtering before expensive vector calculations

## 🧪 Testing

```bash
# Run all tests
cd src
go test -v .

# Run tests with coverage
go test -v . -cover

# Run specific test
go test -v . -run TestSpecificFunction
```

### Test Coverage
- HTTP handlers and endpoints
- Matching algorithm services
- Database model operations
- Middleware functionality
- User interaction logic

## 🔒 Security Features

### Authentication & Authorization
- JWT token validation via middleware
- User ID extraction from JWT headers
- Protected endpoints with auth middleware
- Secure user context propagation

### Input Security
- GORM SQL injection protection
- Request validation and sanitization
- Type-safe Go structs for API contracts
- Structured error handling

## 📊 Monitoring & Logging

### Logging
```go
// Go standard logging with structured output
- Service startup and configuration
- Database connection status
- HTTP request/response logging
- Error tracking and debugging
- Algorithm execution tracking
```

### Health Monitoring
- `/health` endpoint for service status
- Database connection health checks
- Service availability monitoring
- Integration with orchestration platforms

## 🚀 Deployment

### Docker Deployment
```bash
# Service runs in Docker via docker-compose
# From project root:
make          # Start all services
make restart  # Restart services
make stop     # Stop services
make down     # Remove containers and volumes
```

### Environment Variables
```bash
# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=matcha_dev
DB_USER=postgres
DB_PASSWORD=password
AUTO_MIGRATE=true

# Service configuration
JWT_SECRET=your-jwt-secret
PORT=8003
```

## 📈 Performance

### Service Performance
- **Lightweight**: Go binary with minimal dependencies
- **Fast startup**: Sub-second service initialization
- **Database**: PostgreSQL with GORM for optimal queries
- **Concurrent**: Goroutine-based request handling

### Scaling
- **Stateless**: No session storage, easy horizontal scaling
- **Database-focused**: PostgreSQL handles data persistence
- **Container-ready**: Docker deployment via compose

## 🔄 API Versioning

Current version: **v1**
- Semantic versioning for breaking changes
- Backward compatibility maintained within major versions
- Deprecation notices provided 3 months before removal

## 📋 TODO / Roadmap

- [x] Enhanced vector matching algorithms ✅
- [ ] Caching layer with Redis integration
- [ ] Performance optimization and indexing  
- [ ] Comprehensive test coverage
- [ ] API documentation and OpenAPI specs
- [ ] Monitoring and observability improvements

## 📞 Support

For issues, feature requests, or questions:
- Create an issue in the repository
- Check the API documentation at `/docs/api_spec.yaml`
- Review logs for debugging information

---

**Built with ❤️ for the Matcha dating platform**
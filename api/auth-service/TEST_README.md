# Auth Service Tests

This directory contains comprehensive tests for the auth-service.

## Test Coverage

The test suite covers all main authentication functionality:

### 1. Registration Tests (`TestRegisterHandler`)
- ✅ Valid user registration with all required fields
- ✅ Validation of missing required fields  
- ✅ Duplicate username/email prevention
- ✅ Password hashing verification
- ✅ Database persistence validation

### 2. Login Tests (`TestLoginHandler`)
- ✅ Login with username
- ✅ Login with email
- ✅ Password verification (bcrypt)
- ✅ Invalid password handling
- ✅ Non-existent user handling
- ✅ JWT token generation
- ✅ Refresh token generation

### 3. Token Verification Tests (`TestVerifyTokenHandler`)
- ✅ Valid JWT verification
- ✅ Missing Authorization header
- ✅ Invalid token format
- ✅ Malformed Authorization header
- ✅ Token signature validation
- ✅ Claims extraction

### 4. Token Refresh Tests (`TestRefreshTokenHandler`)
- ✅ Valid refresh token processing
- ✅ New access token generation
- ✅ New refresh token generation
- ✅ Scope validation (refresh vs access)
- ✅ Invalid token handling
- ✅ Missing refresh token handling

### 5. Logout Tests (`TestLogoutHandler`)
- ✅ Successful logout response

### 6. Health Check Tests (`TestHealthCheck`)
- ✅ Service health endpoint

## Running Tests

### Quick Test Run
```bash
go test -v ./src
```

### With Coverage
```bash
go test -cover ./src
```

### Using Test Script
```bash
./test.sh
```

## Test Environment

The tests use:
- **In-memory SQLite database** for isolation
- **Test JWT secrets** for security
- **Gin test mode** for reduced logging
- **Isolated test router** for each test

## Test Data

Tests automatically:
- Create fresh database for each test run
- Seed test users with known credentials
- Generate valid/invalid JWT tokens for verification
- Clean up after each test

## Dependencies

Required test dependencies:
- `github.com/stretchr/testify` - Assertions and test utilities
- `gorm.io/driver/sqlite` - In-memory database for tests
- All production dependencies

## Test Results

Latest test run:
```
=== RUN   TestRegisterHandler
--- PASS: TestRegisterHandler (0.07s)
=== RUN   TestLoginHandler  
--- PASS: TestLoginHandler (0.20s)
=== RUN   TestVerifyTokenHandler
--- PASS: TestVerifyTokenHandler (0.00s)
=== RUN   TestRefreshTokenHandler
--- PASS: TestRefreshTokenHandler (0.00s)
=== RUN   TestLogoutHandler
--- PASS: TestLogoutHandler (0.00s)
=== RUN   TestHealthCheck
--- PASS: TestHealthCheck (0.00s)
PASS
```

All tests passing ✅

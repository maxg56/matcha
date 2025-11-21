# Common Module

Shared code across all Matcha microservices to eliminate duplication and ensure consistency.

## Purpose

This module provides:
- **Unified User Model**: Single source of truth for user schema
- **Standardized Response Utilities**: Consistent API responses
- **Centralized Validation**: Shared validation logic with custom validators

## Structure

```
common/
├── models/
│   └── user.go           # Unified User model and PublicProfile
├── utils/
│   ├── response.go       # Standardized JSON response helpers
│   └── response_test.go  # Response utility tests
├── validation/
│   ├── validator.go      # Custom validators and validation helpers
│   └── validator_test.go # Validation tests
├── go.mod                # Module dependencies
└── README.md             # This file
```

## Installation

In each service's `go.mod`, add:

```go
require (
    github.com/maxg56/matcha/api/common v0.0.0
)
```

Then run:
```bash
go mod tidy
```

For local development (replace directive):
```go
replace github.com/maxg56/matcha/api/common => ../common
```

## Usage

### Models

```go
import "github.com/maxg56/matcha/api/common/models"

// Use the unified User model
var user models.User
db.First(&user, userID)

// Convert to public profile (hides sensitive fields)
profile := user.ToPublicProfile()
```

### Response Utilities

```go
import "github.com/maxg56/matcha/api/common/utils"

// Success response
utils.RespondSuccess(c, data)

// Error response (parameter order: context, status, message)
utils.RespondError(c, http.StatusBadRequest, "invalid input")

// Convenience methods
utils.RespondBadRequest(c, "invalid input")
utils.RespondUnauthorized(c, "authentication required")
utils.RespondNotFound(c, "user not found")
utils.RespondInternalError(c, "something went wrong")
```

**IMPORTANT**: The parameter order for `RespondError` is **always**:
1. Context (`*gin.Context`)
2. Status code (`int`)
3. Message (`string`)

This fixes the inconsistency that existed in match-service.

### Validation

```go
import "github.com/maxg56/matcha/api/common/validation"

type RegistrationRequest struct {
    Username  string    `validate:"required,username"`
    Email     string    `validate:"required,email"`
    Password  string    `validate:"required,password_strength"`
    BirthDate time.Time `validate:"required,age_requirement"`
    Gender    string    `validate:"required,gender"`
    SexPref   string    `validate:"required,sex_pref"`
}

// Validate struct
err := validation.ValidateStruct(req)
if err != nil {
    errors := validation.FormatValidationErrors(err)
    utils.RespondBadRequest(c, strings.Join(errors, "; "))
    return
}

// Helper functions
if !validation.IsValidEmail(email) {
    // handle error
}

// Sanitize user input
cleanInput := validation.SanitizeInput(userInput)
```

## Custom Validators

The validation package includes:

- `username`: 3-30 chars, alphanumeric with `_` and `-`
- `password_strength`: Min 8 chars with uppercase, lowercase, number, special char
- `age_requirement`: Must be 18+ years old
- `gender`: Must be one of: `man`, `woman`, `non-binary`
- `sex_pref`: Must be one of: `men`, `women`, `both`

## Testing

Run tests for the common module:

```bash
cd api/common
go test ./... -v
go test ./... -cover
```

## Migration Guide

### For Service Owners

When migrating a service to use the common module:

1. **Add dependency**:
   ```bash
   cd api/your-service
   go get github.com/maxg56/matcha/api/common
   # Or for local dev:
   # Add replace directive to go.mod
   ```

2. **Update imports**:
   ```go
   // Old
   import "your-service/models"
   import "your-service/utils"

   // New
   import "github.com/maxg56/matcha/api/common/models"
   import "github.com/maxg56/matcha/api/common/utils"
   import "github.com/maxg56/matcha/api/common/validation"
   ```

3. **Update User references**:
   - For auth-service: Replace `models.Users` with `models.User`
   - Keep service-specific relations (Tags, Images) as embedded or separate

4. **Fix RespondError calls** (if in match-service):
   ```go
   // Old (incorrect parameter order)
   utils.RespondError(c, "message", http.StatusBadRequest)

   // New (correct parameter order)
   utils.RespondError(c, http.StatusBadRequest, "message")
   ```

5. **Run tests** to ensure compatibility

## Design Decisions

### Why Not Include Relationships in User Model?

The base `User` model doesn't include GORM relationships (Tags, Images, etc.) because:
- Different services need different relationships
- Avoids circular dependencies
- Services can embed the common User and add their own relations:

```go
// In user-service
type UserWithRelations struct {
    models.User // Embed common User
    Tags   []Tag   `gorm:"many2many:user_tags;"`
    Images []Image `gorm:"foreignKey:UserID"`
}
```

### Parameter Order Standardization

All response functions follow the pattern:
```go
Function(context, statusCode, message/data)
```

This provides consistency and predictability across all services.

## Maintenance

When adding new fields to the User model:
1. Update `api/common/models/user.go`
2. Update `PublicProfile` if the field should be public
3. Run tests: `go test ./...`
4. Update all services that use the model
5. Create database migration if needed

## Future Enhancements

- [ ] Add gRPC protobuf definitions for inter-service communication
- [ ] Add common middleware (rate limiting, logging)
- [ ] Add common error types and codes
- [ ] Add JWT utilities for shared token handling
- [ ] Add metrics/observability helpers

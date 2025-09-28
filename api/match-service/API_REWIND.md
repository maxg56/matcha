# Premium Rewind API Endpoints

## Overview
The Premium Rewind feature allows Premium users to undo their last swipe action (like, pass, or super like) within a 10-minute window.

## Endpoints

### GET /api/v1/matches/premium/rewind/availability

Check if the user can rewind their last action.

**Authentication:** Required (JWT Bearer token)

**Response:**
```json
{
  "success": true,
  "data": {
    "can_rewind": true,
    "last_interaction_id": 123,
    "last_interaction_type": "like",
    "expires_at": "2024-03-14T10:35:00Z",
    "time_remaining": 420
  }
}
```

**Response when no rewind available:**
```json
{
  "success": true,
  "data": {
    "can_rewind": false,
    "reason": "No recent interactions to rewind"
  }
}
```

**Response Fields:**
- `can_rewind`: Boolean indicating if rewind is possible
- `last_interaction_id`: ID of the last interaction (if available)
- `last_interaction_type`: Type of interaction ("like", "pass", "super_like")
- `expires_at`: ISO timestamp when rewind expires
- `time_remaining`: Seconds remaining to perform rewind
- `reason`: Explanation if rewind is not available

### POST /api/v1/matches/premium/rewind/perform

Perform the rewind action to undo the last swipe.

**Authentication:** Required (JWT Bearer token)

**Request Body:** None required

**Success Response:**
```json
{
  "success": true,
  "data": {
    "message": "Rewind performed successfully",
    "user_id": 123
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No rewind available"
}
```

## Business Logic

### Rewind Window
- Rewinds are available for **10 minutes** after the original action
- Each interaction can only be rewound once
- Expired rewinds are automatically cleaned up

### Supported Actions
- **Like**: Removes the like and any resulting match
- **Pass**: Removes the pass, making the profile available again
- **Super Like**: Removes the super like and any resulting match

### Database Tables

#### `rewinds` Table
```sql
CREATE TABLE rewinds (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    original_interaction_id INTEGER NOT NULL,
    rewind_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);
```

#### Indexes
```sql
CREATE INDEX idx_rewinds_user_id ON rewinds(user_id);
CREATE INDEX idx_rewinds_interaction_id ON rewinds(original_interaction_id);
CREATE INDEX idx_rewinds_expires_at ON rewinds(expires_at);
```

## Error Codes

- `400 Bad Request`: Invalid request or rewind not available
- `401 Unauthorized`: Missing or invalid authentication
- `500 Internal Server Error`: Database or server error

## Usage Example

```bash
# Check rewind availability
curl -X GET "http://localhost:8003/api/v1/matches/premium/rewind/availability" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Perform rewind
curl -X POST "http://localhost:8003/api/v1/matches/premium/rewind/perform" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Integration Notes

- This endpoint should only be accessible to Premium users
- The frontend should poll the availability endpoint to update rewind button state
- Consider rate limiting to prevent abuse
- Clean up expired rewind records periodically
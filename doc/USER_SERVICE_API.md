# User Service API Documentation

## Service Overview
- **Port**: 8002
- **Base URL**: `/api/v1/users`
- **Authentication**: JWT Bearer token required for protected endpoints

## Response Format
All responses follow the standardized format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "error message"
}
```

---

## Public Endpoints

### Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "service": "user-service"
}
```

### Get User Profile
```
GET /api/v1/users/profile/:id
```
**Description**: Retrieves public profile information for any user

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 123,
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "age": 25,
      "bio": "Love hiking and photography",
      "fame": 85,
      "gender": "male",
      "sex_preference": "female",
      "tags": ["hiking", "photography"],
      "images": [
        {
          "id": 1,
          "url": "/uploads/images/filename.jpg",
          "is_profile": true,
          "description": "Profile picture"
        }
      ]
    }
  }
}
```

### Get User Images
```
GET /api/v1/users/:id/images
```
**Description**: Retrieves all active images for a user

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": 1,
        "filename": "image.jpg",
        "url": "/uploads/images/image.jpg",
        "is_profile": true,
        "description": "My profile picture",
        "alt_text": "John smiling",
        "width": 800,
        "height": 600,
        "created_at": "2023-01-01T12:00:00Z"
      }
    ],
    "total": 5
  }
}
```

---

## Protected Endpoints
*All endpoints below require JWT authentication*

## Profile Management

### Get Own Profile
```
GET /api/v1/users/profile
```
**Description**: Retrieves the authenticated user's complete profile

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": 123,
      "username": "johndoe",
      "first_name": "John",
      // ... complete profile data including private fields
    }
  }
}
```

### Update Profile
```
POST /api/v1/users/profile/:id
PUT /api/v1/users/profile/:id
```
**Description**: Updates user profile (users can only update their own profile)

**Request Body:**
```json
{
  "height": 180,
  "hair_color": "brown",
  "eye_color": "blue",
  "skin_color": "fair",
  "alcohol_consumption": "occasionally",
  "smoking": "never",
  "cannabis": "never",
  "drugs": "never",
  "pets": "dog",
  "social_activity_level": "active",
  "sport_activity": "regularly",
  "education_level": "masters",
  "personal_opinion": "Open-minded and curious",
  "bio": "Updated biography",
  "birth_city": "Paris",
  "current_city": "London",
  "job": "Software Engineer",
  "religion": "agnostic",
  "children_status": "none",
  "children_details": "",
  "zodiac_sign": "aquarius",
  "political_view": "moderate",
  "tags": ["hiking", "photography", "travel"]
}
```
*All fields are optional*

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "profile": {
      // Updated profile data
    }
  }
}
```

### Delete Profile
```
DELETE /api/v1/users/profile/:id
```
**Description**: Soft deletes user profile and related data (cascade delete)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Profile deleted successfully"
  }
}
```

## Location Management

### Update Location
```
PUT /api/v1/users/:id/location
```
**Description**: Updates user's current location coordinates

**Request Body:**
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522
}
```
*latitude: required, -90 to 90*  
*longitude: required, -180 to 180*

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Location updated successfully",
    "latitude": 48.8566,
    "longitude": 2.3522
  }
}
```

### Get Nearby Users
```
GET /api/v1/users/nearby
```
**Description**: Finds users within specified radius of current user's location

**Query Parameters:**
- `radius` (optional): Search radius in kilometers (default: 50)
- `limit` (optional): Maximum results (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "profile": {
          // User profile data
        },
        "distance_km": 12.5
      }
    ],
    "radius_km": 50,
    "total_found": 15,
    "user_location": {
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  }
}
```

## Search Functionality

### Search Users
```
GET /api/v1/users/search
```
**Description**: Advanced user search with multiple filters

**Query Parameters:**
- `age_min` (optional): Minimum age
- `age_max` (optional): Maximum age
- `max_distance` (optional): Maximum distance in km
- `fame_min` (optional): Minimum fame score
- `gender` (optional): Gender filter
- `current_city` (optional): City search (partial match)
- `is_online` (optional): Online status filter
- `has_images` (optional): Filter users with images
- `tags` (optional): Comma-separated tag names
- `limit` (optional): Results limit (default: 20)
- `offset` (optional): Results offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "profile": {
          // User profile data
        },
        "distance_km": 25.3
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0
    },
    "search_params": {
      // Echo of search parameters used
    }
  }
}
```

## Matching Preferences

### Get Preferences
```
GET /api/v1/users/:id/preferences
```
**Description**: Retrieves user's matching preferences (own preferences only)

**Response:**
```json
{
  "success": true,
  "data": {
    "preferences": {
      "id": 1,
      "user_id": 123,
      "age_min": 21,
      "age_max": 35,
      "max_distance": 50.0,
      "min_fame": 0,
      "preferred_genders": ["male", "female"],
      "required_tags": ["outdoors"],
      "blocked_tags": ["smoking"],
      "created_at": "2023-01-01T12:00:00Z",
      "updated_at": "2023-01-01T12:00:00Z"
    }
  }
}
```

### Update Preferences
```
PUT /api/v1/users/:id/preferences
```
**Description**: Updates or creates user's matching preferences

**Request Body:**
```json
{
  "age_min": 21,
  "age_max": 35,
  "max_distance": 50.0,
  "min_fame": 10,
  "preferred_genders": ["male", "female", "other"],
  "required_tags": ["travel", "music"],
  "blocked_tags": ["smoking", "drugs"]
}
```
*All fields are required*
- `age_min`, `age_max`: 18-99, age_min must be < age_max
- `max_distance`: 1-10000 km
- `min_fame`: >= 0
- `preferred_genders`: Array of gender strings

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Preferences updated successfully",
    "preferences": {
      // Updated preferences data
    }
  }
}
```

## User Reporting

### Create Report
```
POST /api/v1/users/reports
```
**Description**: Creates a report against another user

**Request Body:**
```json
{
  "reported_id": 456,
  "report_type": "inappropriate_content",
  "description": "Inappropriate images in profile"
}
```
- `reported_id`: Required, ID of user being reported
- `report_type`: Required, one of: `fake_account`, `inappropriate_content`, `harassment`, `spam`, `other`
- `description`: Optional, max 500 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Report submitted successfully",
    "report": {
      "id": 1,
      "reported_id": 456,
      "report_type": "inappropriate_content",
      "status": "pending",
      "created_at": "2023-01-01T12:00:00Z"
    }
  }
}
```

### Get User Reports
```
GET /api/v1/users/reports
```
**Description**: Retrieves reports submitted by the authenticated user

**Query Parameters:**
- `limit` (optional): Results limit (default: 20)
- `offset` (optional): Results offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [
      {
        "id": 1,
        "reported_id": 456,
        "report_type": "spam",
        "description": "Sending unwanted messages",
        "status": "pending",
        "created_at": "2023-01-01T12:00:00Z",
        "updated_at": "2023-01-01T12:00:00Z",
        "reported_user": {
          "id": 456,
          "username": "spammer"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 20,
      "offset": 0
    }
  }
}
```

## Profile View Tracking

### Track Profile View
```
POST /api/v1/users/profile/:id/view
```
**Description**: Records that the authenticated user viewed another user's profile (limited to once per hour to prevent spam)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Profile view tracked successfully",
    "viewed_id": 456,
    "tracked": true
  }
}
```
*tracked: false if view was already recorded in the last hour*

### Get Profile Viewers
```
GET /api/v1/users/profile/viewers
```
**Description**: Gets users who viewed the authenticated user's profile

**Query Parameters:**
- `limit` (optional): Results limit (default: 20)
- `offset` (optional): Results offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "viewers": [
      {
        "viewer": {
          "id": 789,
          "username": "viewer1",
          "first_name": "Alice",
          "age": 28,
          "fame": 75
        },
        "viewed_at": "2023-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 20,
      "offset": 0
    }
  }
}
```

### Get Profile View Statistics
```
GET /api/v1/users/profile/views/stats
```
**Description**: Gets profile view statistics for the authenticated user

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_views": 150,
      "unique_viewers": 85,
      "weekly_views": 25,
      "daily_views": 5,
      "last_viewed_at": "2023-01-01T12:00:00Z"
    }
  }
}
```

### Get My Profile Views History
```
GET /api/v1/users/profile/views/history
```
**Description**: Gets profiles that the authenticated user has viewed

**Query Parameters:**
- `limit` (optional): Results limit (default: 20)
- `offset` (optional): Results offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "viewed_profiles": [
      {
        "profile": {
          "id": 456,
          "username": "vieweduser",
          "first_name": "Bob",
          "age": 30,
          "fame": 65
        },
        "viewed_at": "2023-01-01T11:30:00Z"
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 20,
      "offset": 0
    }
  }
}
```

## Media Management

### Update Image Order
```
PUT /api/v1/users/:id/images/order
```
**Description**: Updates image order and sets profile image (only one profile image allowed)

**Request Body:**
```json
{
  "image_orders": [
    {
      "image_id": 1,
      "is_profile": true
    },
    {
      "image_id": 2,
      "is_profile": false
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Image order updated successfully",
    "images": [
      {
        "id": 1,
        "filename": "profile.jpg",
        "url": "/uploads/images/profile.jpg",
        "is_profile": true,
        "description": "My profile picture",
        "created_at": "2023-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Delete Image
```
DELETE /api/v1/users/:id/images/:image_id
```
**Description**: Soft deletes a user image (sets is_active to false)

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Image deleted successfully",
    "image_id": 123
  }
}
```

### Update Image Details
```
PUT /api/v1/users/:id/images/:image_id
```
**Description**: Updates image description and alt text

**Request Body:**
```json
{
  "description": "Updated description",
  "alt_text": "Updated alt text"
}
```
- `description`: Max 200 characters
- `alt_text`: Max 100 characters

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Image details updated successfully",
    "image": {
      "id": 123,
      "description": "Updated description",
      "alt_text": "Updated alt text",
      "updated_at": "2023-01-01T12:30:00Z"
    }
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid parameters or request body |
| 401 | Unauthorized - Missing or invalid JWT token |
| 403 | Forbidden - Access denied (e.g., trying to modify another user's data) |
| 404 | Not Found - Requested resource doesn't exist |
| 409 | Conflict - Resource already exists (e.g., duplicate report) |
| 500 | Internal Server Error - Server-side error |

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

The JWT token should contain the user ID, which is used for authorization checks.
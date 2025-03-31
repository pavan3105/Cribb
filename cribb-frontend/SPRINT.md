# Sprint 2 Documentation

## Completed Work

### Frontend Development
- Implemented user authentication flow
- Created responsive landing page
- Developed signup and login forms with validation
- Integrated backend API endpoints for authentication
- Built initial dashboard interface
- Added form validation and error handling
- Implemented password visibility toggle

### Backend Integration
- Completed API integration for user authentication
- Implemented signup functionality with database integration
- Added login endpoint with JWT token authentication
- Created dashboard data endpoints

## Testing Implementation

### Unit Tests
1. Landing Component Tests:
```typescript
- Component creation verification
- Main heading render check
- Welcome text content verification
```

2. Login Component Tests:
```typescript
- Component initialization
- Form validation checks
- Password visibility toggle
- Error message display
- API service integration
```

3. Signup Component Tests:
```typescript
- Form initialization validation
- Password requirement checks
- Phone number format validation
- Modal functionality for group creation/joining
- API integration verification
```

### Cypress End-to-End Tests
```javascript
- Landing page navigation
- Button functionality verification
- Navigation between pages
- Responsive design checks
```

## Test Coverage Summary
- **Unit Tests**: 85% coverage of components
- **E2E Tests**: Core user flows covered
- **Integration Tests**: API endpoints verified

## API Documentation

### Base URL
```
http://localhost:8080
```

### Authentication
JWT token required for most endpoints:
```
Authorization: Bearer <token>
```

### Implemented Endpoints

#### Authentication Endpoints
1. Register User
```http
POST /api/register
Content-Type: application/json

{
  "username": "user123",
  "password": "password123",
  "name": "John Doe",
  "phone_number": "1234567890"
}
```

2. Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "user123",
  "password": "password123"
}
```

#### User Endpoints
1. Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

2. Get User by Username
```http
GET /api/users/by-username?username=user123
Authorization: Bearer <token>
```

#### Group Endpoints
1. Create Group
```http
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Apartment 101"
}
```

2. Join Group
```http
POST /api/groups/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "user123",
  "group_name": "Apartment 101"
}
```

### Response Models

#### User Model
```json
{
  "id": "string (ObjectID)",
  "username": "string",
  "name": "string",
  "phone_number": "string",
  "score": "integer",
  "group": "string",
  "group_id": "string (ObjectID)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Group Model
```json
{
  "id": "string (ObjectID)",
  "name": "string",
  "members": ["string (ObjectID)"],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 409: Conflict
- 500: Server Error

### Integration Progress
- ✅ User authentication endpoints
- ✅ Basic user management
- ✅ Group creation and joining
- 🔄 Chore management (in progress)

## Next Sprint Goals
- Implement group management features
- Add profile management
- Enhance dashboard functionality
- Increase test coverage to 90%
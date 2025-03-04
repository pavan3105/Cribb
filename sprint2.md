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

## Next Sprint Goals
- Implement group management features
- Add profile management
- Enhance dashboard functionality
- Increase test coverage to 90%

# Cribb Backend API Documentation

## Introduction
The Cribb Backend API provides a set of endpoints to interact with the Cribb platform. This documentation outlines the available endpoints, request formats, and responses.

## Base URL
```
https://api.cribb.com/v1
```

## Authentication
All requests must include an authentication token in the header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### User Authentication
#### Login
**Endpoint:**
```
POST /auth/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
**Response:**
```json
{
  "token": "your_jwt_token",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

#### Register
**Endpoint:**
```
POST /auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "yourpassword"
}
```
**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Property Management
#### Get All Properties
**Endpoint:**
```
GET /properties
```
**Response:**
```json
[
  {
    "id": 1,
    "name": "Luxury Apartment",
    "location": "New York, NY",
    "price": 2500,
    "available": true
  }
]
```

#### Get Property by ID
**Endpoint:**
```
GET /properties/{id}
```
**Response:**
```json
{
  "id": 1,
  "name": "Luxury Apartment",
  "location": "New York, NY",
  "price": 2500,
  "available": true
}
```

#### Create Property
**Endpoint:**
```
POST /properties
```
**Request Body:**
```json
{
  "name": "Luxury Apartment",
  "location": "New York, NY",
  "price": 2500,
  "available": true
}
```
**Response:**
```json
{
  "message": "Property created successfully",
  "property": {
    "id": 2,
    "name": "Luxury Apartment",
    "location": "New York, NY",
    "price": 2500,
    "available": true
  }
}
```

#### Update Property
**Endpoint:**
```
PUT /properties/{id}
```
**Request Body:**
```json
{
  "price": 2700
}
```
**Response:**
```json
{
  "message": "Property updated successfully",
  "property": {
    "id": 1,
    "name": "Luxury Apartment",
    "location": "New York, NY",
    "price": 2700,
    "available": true
  }
}
```

#### Delete Property
**Endpoint:**
```
DELETE /properties/{id}
```
**Response:**
```json
{
  "message": "Property deleted successfully"
}
```

## Error Handling
Errors are returned in the following format:
```json
{
  "error": "Error message"
}
```

## Conclusion
This API enables users to authenticate, manage properties, and interact with the Cribb platform effectively. For any questions or further assistance, please contact the support team.
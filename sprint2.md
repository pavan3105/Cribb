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

# Cribb Backend API Documentation

## Authentication Endpoints

### 1. User Registration
- **Endpoint:** `/api/register`
- **Method:** POST
- **Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "phone_number": "string",
  "room_number": "string",
  "group": "string (optional)",
  "groupCode": "string (optional)"
}
```
- **Success Response:** 
  - Status Code: 201
  - Body includes user details and JWT token
- **Validation:**
  - Requires username, password, name, phone number, and room number
  - Either group or groupCode must be provided (but not both)

### 2. User Login
- **Endpoint:** `/api/login`
- **Method:** POST
- **Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
- **Success Response:**
  - Status Code: 200
  - Body includes user details and JWT token

## User Endpoints

### 3. Get User Profile
- **Endpoint:** `/api/users/profile`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Success Response:**
  - Status Code: 200
  - Returns user profile details

### 4. Get All Users
- **Endpoint:** `/api/users`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Success Response:**
  - Status Code: 200
  - Returns list of all users

### 5. Get User by Username
- **Endpoint:** `/api/users/by-username`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `username`: User's username
- **Success Response:**
  - Status Code: 200
  - Returns user details

### 6. Get Users Sorted by Score
- **Endpoint:** `/api/users/by-score`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Success Response:**
  - Status Code: 200
  - Returns list of users sorted by score in descending order

## Group Endpoints

### 7. Create Group
- **Endpoint:** `/api/groups`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "name": "string"
}
```
- **Success Response:**
  - Status Code: 201
  - Returns created group details with generated group code

### 8. Join Group
- **Endpoint:** `/api/groups/join`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "username": "string",
  "group_name": "string (optional)",
  "groupCode": "string (optional)",
  "roomNo": "string (optional)"
}
```
- **Success Response:**
  - Status Code: 200
  - Adds user to the specified group

### 9. Get Group Members
- **Endpoint:** `/api/groups/members`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name (optional)
  - `group_code`: Group code (optional)
- **Success Response:**
  - Status Code: 200
  - Returns list of group members

## Chore Endpoints

### 10. Create Individual Chore
- **Endpoint:** `/api/chores/individual`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "group_name": "string",
  "assigned_to": "string (username)",
  "due_date": "datetime",
  "points": "number"
}
```
- **Success Response:**
  - Status Code: 201
  - Returns created chore details

### 11. Create Recurring Chore
- **Endpoint:** `/api/chores/recurring`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "group_name": "string",
  "frequency": "string (daily/weekly/biweekly/monthly)",
  "points": "number"
}
```
- **Success Response:**
  - Status Code: 201
  - Returns created recurring chore details

### 12. Get User Chores
- **Endpoint:** `/api/chores/user`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `username`: User's username
- **Success Response:**
  - Status Code: 200
  - Returns list of chores assigned to the user

### 13. Get Group Chores
- **Endpoint:** `/api/chores/group`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name
- **Success Response:**
  - Status Code: 200
  - Returns list of chores in the group

### 14. Get Group Recurring Chores
- **Endpoint:** `/api/chores/group/recurring`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name
- **Success Response:**
  - Status Code: 200
  - Returns list of recurring chores in the group

### 15. Complete Chore
- **Endpoint:** `/api/chores/complete`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "chore_id": "string",
  "username": "string"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns points earned and new user score

### 16. Update Chore
- **Endpoint:** `/api/chores/update`
- **Method:** PUT
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "chore_id": "string",
  "title": "string (optional)",
  "description": "string (optional)",
  "assigned_to": "string (optional)",
  "due_date": "datetime (optional)",
  "points": "number (optional)"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns updated chore details

### 17. Delete Chore
- **Endpoint:** `/api/chores/delete`
- **Method:** DELETE
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `chore_id`: ID of the chore to delete
- **Success Response:**
  - Status Code: 200
  - Returns success message

### 18. Update Recurring Chore
- **Endpoint:** `/api/chores/recurring/update`
- **Method:** PUT
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "recurring_chore_id": "string",
  "title": "string (optional)",
  "description": "string (optional)",
  "frequency": "string (optional)",
  "points": "number (optional)",
  "is_active": "boolean (optional)"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns updated recurring chore details

### 19. Delete Recurring Chore
- **Endpoint:** `/api/chores/recurring/delete`
- **Method:** DELETE
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `recurring_chore_id`: ID of the recurring chore to delete
- **Success Response:**
  - Status Code: 200
  - Returns success message

## Authentication
- All endpoints except `/api/login` and `/api/register` require a Bearer Token in the Authorization header
- Token is obtained during login and should be included in subsequent requests

## Error Handling
- Endpoints return appropriate HTTP status codes
- Error responses include descriptive messages
- Common status codes:
  - 200: Successful request
  - 201: Resource created
  - 400: Bad request
  - 401: Unauthorized
  - 404: Resource not found
  - 500: Internal server error

## Base URL
- Local Development: `http://localhost:8080`

## CORS
- Configured to allow requests from `http://localhost:4200`

# Cribb Backend Test Results

## Test Overview

The test suite for Cribb Backend includes unit tests for:
- Authentication & user management (handlers/auth_test.go)
- Chore management (handlers/chore_test.go)
- Group management (handlers/group_test.go)
- User data access (handlers/user_test.go)
- Middleware functionality (middleware/auth_test.go)
- Data models (models/chore_test.go)

## Test Approach

All tests use an in-memory database (`TestDB`) to avoid external dependencies on MongoDB. This approach:
- Makes tests faster and more reliable
- Isolates tests from network/database issues
- Allows for better control of test scenarios

## Test Results

```
go test -v ./handlers
=== RUN   TestRegisterHandler
--- PASS: TestRegisterHandler (0.06s)
=== RUN   TestLoginHandler
--- PASS: TestLoginHandler (0.12s)
=== RUN   TestGetUserProfileHandler
--- PASS: TestGetUserProfileHandler (0.00s)
=== RUN   TestGenerateJWTToken
--- PASS: TestGenerateJWTToken (0.00s)
=== RUN   TestCreateIndividualChoreHandler
--- PASS: TestCreateIndividualChoreHandler (0.00s)
=== RUN   TestCreateRecurringChoreHandler
--- PASS: TestCreateRecurringChoreHandler (0.00s)
=== RUN   TestGetUserChoresHandler
--- PASS: TestGetUserChoresHandler (0.00s)
=== RUN   TestCompleteChoreHandler
--- PASS: TestCompleteChoreHandler (0.00s)
=== RUN   TestUpdateChoreHandler
--- PASS: TestUpdateChoreHandler (0.00s)
=== RUN   TestDeleteChoreHandler
--- PASS: TestDeleteChoreHandler (0.00s)
=== RUN   TestCreateGroupHandler
--- PASS: TestCreateGroupHandler (0.00s)
=== RUN   TestJoinGroupHandler
--- PASS: TestJoinGroupHandler (0.00s)
=== RUN   TestGetGroupMembersHandler
--- PASS: TestGetGroupMembersHandler (0.00s)
=== RUN   TestGetGroupMembersHandlerByCode
--- PASS: TestGetGroupMembersHandlerByCode (0.00s)
=== RUN   TestGetGroupMembersMissingParameters
--- PASS: TestGetGroupMembersMissingParameters (0.00s)
=== RUN   TestGetUsersHandler
--- PASS: TestGetUsersHandler (0.00s)
=== RUN   TestGetUserByUsernameHandler
--- PASS: TestGetUserByUsernameHandler (0.00s)
=== RUN   TestGetUserByUsernameMissingParameter
--- PASS: TestGetUserByUsernameMissingParameter (0.00s)
=== RUN   TestGetUsersByScoreHandler
--- PASS: TestGetUsersByScoreHandler (0.00s)
PASS
ok      cribb-backend/handlers  (cached)

go test -v ./middleware_test
=== RUN   TestAuthMiddleware
--- PASS: TestAuthMiddleware (0.00s)
=== RUN   TestAuthMiddlewareMissingToken
--- PASS: TestAuthMiddlewareMissingToken (0.00s)
=== RUN   TestAuthMiddlewareInvalidToken
--- PASS: TestAuthMiddlewareInvalidToken (0.00s)
=== RUN   TestGetUserFromContext
--- PASS: TestGetUserFromContext (0.00s)
=== RUN   TestGetUserFromContextMissing
--- PASS: TestGetUserFromContextMissing (0.00s)
=== RUN   TestCORSMiddleware
--- PASS: TestCORSMiddleware (0.00s)
=== RUN   TestCORSMiddlewareOptions
--- PASS: TestCORSMiddlewareOptions (0.00s)
PASS
ok      cribb-backend/middleware  (cached)

go test -v ./models_test    
=== RUN   TestCreateChore
--- PASS: TestCreateChore (0.00s)
=== RUN   TestCreateRecurringChore
--- PASS: TestCreateRecurringChore (0.00s)
=== RUN   TestGetNextAssignee
--- PASS: TestGetNextAssignee (0.00s)
=== RUN   TestCreateChoreFromRecurring
--- PASS: TestCreateChoreFromRecurring (0.00s)
=== RUN   TestNewGroup
--- PASS: TestNewGroup (0.00s)
=== RUN   TestGenerateGroupCode
--- PASS: TestGenerateGroupCode (0.00s)
PASS
ok      cribb-backend/models  (cached)
```

## Test Explanation

### Authentication & User Management Tests

- **TestRegisterHandler**: Verifies user registration works correctly with proper validation.
- **TestLoginHandler**: Ensures users can log in with valid credentials and JWT tokens are generated.
- **TestGetUserProfileHandler**: Confirms that authenticated users can retrieve their profiles.
- **TestGenerateJWTToken**: Tests the JWT token generation function directly.

### Chore Management Tests

- **TestCreateIndividualChoreHandler**: Tests creation of individual chores with proper assignment.
- **TestCreateRecurringChoreHandler**: Verifies recurring chore creation with member rotation.
- **TestGetUserChoresHandler**: Ensures users can retrieve their assigned chores.
- **TestCompleteChoreHandler**: Tests the chore completion flow, including score updates.
- **TestUpdateChoreHandler**: Verifies chore details can be updated properly.
- **TestDeleteChoreHandler**: Tests chore deletion functionality.

### Group Management Tests

- **TestCreateGroupHandler**: Tests group creation with proper validation.
- **TestJoinGroupHandler**: Verifies users can join existing groups using codes.
- **TestGetGroupMembersHandler**: Tests retrieving group members by group name.
- **TestGetGroupMembersHandlerByCode**: Tests retrieving group members by group code.
- **TestGetGroupMembersMissingParameters**: Verifies proper error handling for missing parameters.

### User Data Access Tests

- **TestGetUsersHandler**: Tests retrieving all users.
- **TestGetUserByUsernameHandler**: Verifies finding users by username.
- **TestGetUserByUsernameMissingParameter**: Tests error handling for missing parameters.
- **TestGetUsersByScoreHandler**: Ensures users can be sorted by score correctly.

### Middleware Tests

- **TestAuthMiddleware**: Verifies the authentication middleware correctly checks JWT tokens.
- **TestAuthMiddlewareMissingToken**: Tests handling of missing auth tokens.
- **TestAuthMiddlewareInvalidToken**: Verifies rejection of invalid tokens.
- **TestGetUserFromContext**: Ensures user details can be retrieved from the request context.
- **TestGetUserFromContextMissing**: Tests proper handling when user details are missing.
- **TestCORSMiddleware**: Verifies CORS headers are correctly applied.
- **TestCORSMiddlewareOptions**: Tests handling of OPTIONS requests for CORS preflight.

### Model Tests

- **TestCreateChore**: Verifies chore creation with proper fields.
- **TestCreateRecurringChore**: Tests recurring chore creation logic.
- **TestGetNextAssignee**: Ensures proper member rotation in recurring chores.
- **TestCreateChoreFromRecurring**: Tests generation of chore instances from recurring templates.
- **TestNewGroup**: Verifies group creation with proper fields.
- **TestGenerateGroupCode**: Tests the uniqueness and format of generated group codes.

## Test Coverage

The tests cover all the main functionality of the Cribb Backend application:

- Authentication flow (register, login, profile)
- Chore management lifecycle (create, get, update, delete, complete)
- Recurring chore management
- Group management (create, join, member listing)
- User data access and sorting

## Running Tests

To run all tests:
```
go test ./...
```

To run tests for a specific package:
```
go test ./handlers
go test ./middleware_test
go test ./models_test
```

To run a specific test:
```
go test -run TestRegisterHandler ./handlers
```

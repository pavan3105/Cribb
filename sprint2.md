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

# API Testing Log

## Health Check
✓ **Health check successful**

## User Registration
✓ **User registration successful**  
**TOKEN:** `eyJhbGciOiJIUzI1NiIs...`  
**USER_ID:** `67c69036eceb756992a24152`  
**USERNAME:** `testuser1741066294`  
**GROUP_CODE:** `SEMUWD`

## Register Second User
✓ **Second user registration successful**  
**SECOND_USERNAME:** `testuser21741066295`

## User Login
✓ **User login successful**  
**Updated TOKEN:** `eyJhbGciOiJIUzI1NiIs...`

## Get User Profile
✓ **Get user profile successful**

## Get All Users
✓ **Get all users successful**

## Get User by Username
✓ **Get user by username successful**

## Get Users by Score
✓ **Get users by score successful**

## Get Group Members
✓ **Get group members successful**

## Create Individual Chore
✓ **Create individual chore successful**  
**CHORE_ID:** `67c69039eceb756992a24154`

## Get User Chores
✓ **Get user chores successful**

## Get Group Chores
✓ **Get group chores successful**

## Update Chore
✓ **Update chore successful**

## Create Recurring Chore
✓ **Create recurring chore successful**  
**RECURRING_CHORE_ID:** `67c6903aeceb756992a24155`

## Get Group Recurring Chores
✓ **Get group recurring chores successful**

## Update Recurring Chore
✓ **Update recurring chore successful**

## Complete Chore
✓ **Complete chore successful**

## Delete Recurring Chore
✓ **Delete recurring chore successful**

## Create Another Chore for Deletion Test
✓ **Create chore for deletion successful**  
**DELETE_CHORE_ID:** `67c6903ceceb756992a24158`

## Delete Chore
✓ **Delete chore successful**

# API Testing Complete!

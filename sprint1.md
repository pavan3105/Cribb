# User Stories: Frontend and Backend System

## Frontend Stories

### User Authentication

#### User Story: Sign Up
As a new user, I want to create an account to access the system.

**Acceptance Criteria:**
- User can enter username, email, and password
- Shows success message on successful registration
- Redirects to login page after successful registration

#### User Story: Login
As a registered user, I want to log in to access my account.

**Acceptance Criteria:**
- User can enter username/email and password
- Redirects to profile page on successful login

#### User Story: User Profile
As a logged-in user, I want to view and manage my profile information.

**Acceptance Criteria:**
- Displays user's basic information
- Shows user's apartment group
- Lists user's activity/score

## Backend Stories

### User Management

1. **Get All Users:**
   - Admin users should be able to fetch a list of all users.

2. **Get User by Username:**
   - Admin users should retrieve user details by providing a username as a query parameter.

3. **Get Users by Score:**
   - Admin users should retrieve users sorted by their scores in descending order.

### Group Management

1. **Create a Group:**
   - Admin users should be able to create new groups with a unique name.
   - The system should ensure no duplicate group names are allowed.

2. **Join a Group:**
   - Admin users should allow users to join existing groups.
   - The system must associate users with groups and update both user and group data accordingly.
   - Transactions should ensure data consistency when updating user and group collections.

3. **Retrieve Group Members:**
   - Admin users should be able to retrieve a list of all members within a specified group.
   - The system must return a list of users in JSON format.

## Acceptance Criteria

### User Management Scenarios

#### Scenario 1: Get All Users Successfully
- **Given**: The admin user sends a `GET` request to `/users`
- **When**: The request is successful
- **Then**: The system returns a JSON array containing all user objects
- **And**: The HTTP status code is `200 OK`

#### Scenario 2: Handle Fetching Users Error
- **Given**: The admin user sends a `GET` request to `/users`
- **When**: There is a server or database error
- **Then**: The system responds with the message "Failed to fetch users"
- **And**: The HTTP status code is `500 Internal Server Error`

#### Scenario 3: Get User by Username Successfully
- **Given**: The admin user sends a `GET` request to `/users?username={username}`
- **When**: The request is successful and the user exists
- **Then**: The system returns the user object
- **And**: The HTTP status code is `200 OK`

#### Scenario 4: Handle User Not Found by Username
- **Given**: The admin user sends a `GET` request to `/users?username={username}`
- **When**: The user does not exist
- **Then**: The system responds with the message "User not found"
- **And**: The HTTP status code is `404 Not Found`

#### Scenario 5: Get Users by Score Successfully
- **Given**: The admin user sends a `GET` request to `/users/score`
- **When**: The request is successful
- **Then**: The system returns a JSON array of user objects sorted by score in descending order
- **And**: The HTTP status code is `200 OK`

#### Scenario 6: Handle Error Fetching Users by Score
- **Given**: The admin user sends a `GET` request to `/users/score`
- **When**: There is a server or database error
- **Then**: The system responds with the message "Failed to fetch users"
- **And**: The HTTP status code is `500 Internal Server Error`

### Group Management Scenarios

#### Scenario 7: Create Group Successfully
- **Given**: The admin user sends a `POST` request to `/groups/create` with a valid group name
- **When**: The request is successful
- **Then**: The system returns a JSON object containing the created group details
- **And**: The HTTP status code is `201 Created`

#### Scenario 8: Handle Duplicate Group Name
- **Given**: The admin user sends a `POST` request to `/groups/create` with a group name that already exists
- **When**: The system detects a duplicate name
- **Then**: The system responds with the message "Group name already exists"
- **And**: The HTTP status code is `409 Conflict`

#### Scenario 9: Handle Invalid Group Creation Request
- **Given**: The admin user sends a `POST` request to `/groups/create` with an invalid or missing request body
- **When**: The system detects the issue
- **Then**: The system responds with the message "Invalid request body"
- **And**: The HTTP status code is `400 Bad Request`

#### Scenario 10: Join Group Successfully
- **Given**: The admin user sends a `POST` request to `/groups/join` with a valid username and group name
- **When**: Both the user and group exist
- **Then**: The system associates the user with the group and updates both records
- **And**: The HTTP status code is `200 OK`

#### Scenario 11: Handle Nonexistent Group or User
- **Given**: The admin user sends a `POST` request to `/groups/join` with an invalid group or user
- **When**: Either the group or user does not exist
- **Then**: The system responds with an appropriate message, such as "Group not found" or "User not found"
- **And**: The HTTP status code is `404 Not Found`

#### Scenario 12: Retrieve Group Members Successfully
- **Given**: The admin user sends a `GET` request to `/groups/members?group_name={group_name}`
- **When**: The group exists and has members
- **Then**: The system returns a JSON array of user objects in the group
- **And**: The HTTP status code is `200 OK`

#### Scenario 13: Handle Nonexistent Group When Retrieving Members
- **Given**: The admin user sends a `GET` request to `/groups/members?group_name={group_name}` with an invalid group name
- **When**: The group does not exist
- **Then**: The system responds with the message "Group not found"
- **And**: The HTTP status code is `404 Not Found`

#### Scenario 14: Handle Errors When Fetching Group Members
- **Given**: The admin user sends a `GET` request to `/groups/members?group_name={group_name}`
- **When**: There is a database or server error
- **Then**: The system responds with the message "Failed to fetch users"
- **And**: The HTTP status code is `500 Internal Server Error`

## Technical Notes

### Frontend Routes:
- `/signup`: New user registration
- `/login`: User authentication
- `/profile`: User profile management

### Backend Endpoints:
- `/users`: Fetch all users
- `/users?username={username}`: Fetch user by username
- `/users/score`: Fetch users sorted by score
- `/groups/create`: Creates a new group
- `/groups/join`: Allows a user to join a group
- `/groups/members?group_name={group_name}`: Retrieves all members of a group

### Response Format:
```json
{
  "name": "Apartment A202",
  "members": [
    {
      "username": "john_doe",
      "email": "john@example.com"
    },
    {
      "username": "jane_smith",
      "email": "jane@example.com"
    }
  ]
}
```
## Sprint Status

### Frontend Progress

#### Completed Items
- ✅ User registration page
- ✅ Login page with basic authentication UI
- ✅ User profile page layout and design
- ✅ Basic component structure and routing setup

### Backend Progress

#### Completed Items
- ✅ User schema and database setup
- ✅ Basic CRUD endpoints for user management
- ✅ Group creation and management endpoints
- ✅ Error handling middleware

### Challenges and Unmet Goals

#### Input Validation Issues
- ❌ Frontend form validation not implemented due to:
  - Time constraints in learning Angular framework and implementing validation libraries

- ❌ Backend input validation incomplete due to:
  - Time constraints in learning Go framework and implementing validation libraries

These validation issues will be prioritized in the next sprint to ensure data integrity and better user experience.

### Error Handling:
- Proper error messages and status codes should be returned for different failure cases.
- Transactions must ensure consistency during updates.

### Security Considerations:
- Authentication and authorization should be implemented.
- Sanitize user input to prevent injection attacks.
- Restrict operations to authorized admin users.


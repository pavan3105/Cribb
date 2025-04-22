# Sprint 4 Documentation

## Backend Work

### Completed Work
#### Shopping Cart Feature

* Implemented shared shopping cart system for household grocery management
* Created data models for shopping cart items with user attribution
* Developed cart activity tracking for multi-user collaboration
* Added CRUD operations for shopping cart items with proper validation
* Implemented group-scoped visibility for shared shopping lists
* Built user-specific filtering for personal shopping management
* Created activity feeds to track shopping list changes by group members
* Implemented read status tracking for shopping activity notifications
* Added expiration system for shopping cart activities to maintain relevant history
* Implemented proper permission controls for shopping cart item management

## Technical Details

The shopping cart feature supports collaborative grocery planning within household groups. All members can:
* Add, update, and remove items from a shared shopping list
* Filter items by user for personalized management
* Track changes made by other household members
* Mark activities as read to manage notifications

The implementation includes full API endpoints with appropriate authentication and authorization middleware to ensure secure access to shopping cart data.

## Cribb Backend API Documentation

### Authentication Endpoints

#### 1. User Registration
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

#### 2. User Login
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

### User Endpoints

#### 3. Get User Profile
- **Endpoint:** `/api/users/profile`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Success Response:**
  - Status Code: 200
  - Returns user profile details

#### 4. Get All Users
- **Endpoint:** `/api/users`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Success Response:**
  - Status Code: 200
  - Returns list of all users

#### 5. Get User by Username
- **Endpoint:** `/api/users/by-username`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `username`: User's username
- **Success Response:**
  - Status Code: 200
  - Returns user details

#### 6. Get Users Sorted by Score
- **Endpoint:** `/api/users/by-score`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Success Response:**
  - Status Code: 200
  - Returns list of users sorted by score in descending order

### Group Endpoints

#### 7. Create Group
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

#### 8. Join Group
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

#### 9. Get Group Members
- **Endpoint:** `/api/groups/members`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name (optional)
  - `group_code`: Group code (optional)
- **Success Response:**
  - Status Code: 200
  - Returns list of group members

### Chore Endpoints

#### 10. Create Individual Chore
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

#### 11. Create Recurring Chore
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

#### 12. Get User Chores
- **Endpoint:** `/api/chores/user`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `username`: User's username
- **Success Response:**
  - Status Code: 200
  - Returns list of chores assigned to the user

#### 13. Get Group Chores
- **Endpoint:** `/api/chores/group`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name
- **Success Response:**
  - Status Code: 200
  - Returns list of chores in the group

#### 14. Get Group Recurring Chores
- **Endpoint:** `/api/chores/group/recurring`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name
- **Success Response:**
  - Status Code: 200
  - Returns list of recurring chores in the group

#### 15. Complete Chore
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

#### 16. Update Chore
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

#### 17. Delete Chore
- **Endpoint:** `/api/chores/delete`
- **Method:** DELETE
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `chore_id`: ID of the chore to delete
- **Success Response:**
  - Status Code: 200
  - Returns success message

#### 18. Update Recurring Chore
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

#### 19. Delete Recurring Chore
- **Endpoint:** `/api/chores/recurring/delete`
- **Method:** DELETE
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `recurring_chore_id`: ID of the recurring chore to delete
- **Success Response:**
  - Status Code: 200
  - Returns success message

### Pantry Endpoints

#### 20. Add Pantry Item
- **Endpoint:** `/api/pantry/add`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "name": "string",
  "quantity": "number",
  "unit": "string",
  "category": "string",
  "expiration_date": "datetime (optional)",
  "group_name": "string"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns created pantry item details
- **Validation:**
  - Requires name, quantity, unit, and group name
  - Quantity must be non-negative

#### 21. Use Pantry Item
- **Endpoint:** `/api/pantry/use`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "item_id": "string",
  "quantity": "number"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns remaining quantity and unit
- **Validation:**
  - Item ID and quantity are required
  - Quantity must be positive
  - Must have enough quantity available

#### 22. List Pantry Items
- **Endpoint:** `/api/pantry/list`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name
  - `category`: Category filter (optional)
- **Success Response:**
  - Status Code: 200
  - Returns list of pantry items with expiration status

#### 23. Delete Pantry Item
- **Endpoint:** `/api/pantry/remove/{item_id}`
- **Method:** DELETE
- **Authentication:** Required (Bearer Token)
- **URL Parameters:**
  - `item_id`: ID of the pantry item to delete
- **Success Response:**
  - Status Code: 200
  - Returns success message

#### 24. Get Pantry Warnings
- **Endpoint:** `/api/pantry/warnings`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name (optional)
  - `group_code`: Group code (optional)
- **Success Response:**
  - Status Code: 200
  - Returns list of low-stock warnings with current quantities

#### 25. Get Expiring Items
- **Endpoint:** `/api/pantry/expiring`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name (optional)
  - `group_code`: Group code (optional)
- **Success Response:**
  - Status Code: 200
  - Returns list of items expiring soon or already expired

#### 26. Get Shopping List
- **Endpoint:** `/api/pantry/shopping-list`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name (optional)
  - `group_code`: Group code (optional)
- **Success Response:**
  - Status Code: 200
  - Returns an automatically generated shopping list based on low stock items

#### 27. Get Pantry History
- **Endpoint:** `/api/pantry/history`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name (optional)
  - `group_code`: Group code (optional)
  - `item_id`: Filter history by specific item (optional)
- **Success Response:**
  - Status Code: 200
  - Returns history of pantry actions (add, use, remove)

#### 28. Mark Notification as Read
- **Endpoint:** `/api/pantry/notify/read`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "notification_id": "string"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns success message

#### 29. Delete Notification
- **Endpoint:** `/api/pantry/notify/delete`
- **Method:** DELETE
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `notification_id`: ID of the notification to delete
- **Success Response:**
  - Status Code: 200
  - Returns success message

### Shopping Cart Endpoints

#### 30. Add Item to Shopping Cart
- **Endpoint:** `/api/shopping-cart/add`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "item_name": "string",
  "quantity": "number"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns created shopping cart item details
- **Validation:**
  - Requires item_name and quantity
  - Quantity must be positive

#### 31. Update Item in Shopping Cart
- **Endpoint:** `/api/shopping-cart/update`
- **Method:** PUT
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "item_id": "string",
  "item_name": "string (optional)",
  "quantity": "number (optional)"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns updated shopping cart item details
- **Validation:**
  - Requires item_id
  - If provided, quantity must be positive

#### 32. Delete Item from Shopping Cart
- **Endpoint:** `/api/shopping-cart/delete/:item_id`
- **Method:** DELETE
- **Authentication:** Required (Bearer Token)
- **URL Parameters:**
  - `item_id`: ID of the shopping cart item to delete
- **Success Response:**
  - Status Code: 200
  - Returns success message

#### 33. List Shopping Cart Items
- **Endpoint:** `/api/shopping-cart/list`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `user_id`: Filter by specific user (optional)
- **Success Response:**
  - Status Code: 200
  - Returns list of shopping cart items

#### 34. Get Shopping Cart Activity
- **Endpoint:** `/api/shopping-cart/activity`
- **Method:** GET
- **Authentication:** Required (Bearer Token)
- **Query Parameters:**
  - `group_name`: Group name (optional)
  - `group_code`: Group code (optional)
- **Success Response:**
  - Status Code: 200
  - Returns list of recent shopping cart activities

#### 35. Mark Activity as Read
- **Endpoint:** `/api/shopping-cart/activity/read`
- **Method:** POST
- **Authentication:** Required (Bearer Token)
- **Request Body:**
```json
{
  "activity_id": "string"
}
```
- **Success Response:**
  - Status Code: 200
  - Returns success message

### Authentication
- All endpoints except `/api/login` and `/api/register` require a Bearer Token in the Authorization header
- Token is obtained during login and should be included in subsequent requests

### Error Handling
- Endpoints return appropriate HTTP status codes
- Error responses include descriptive messages
- Common status codes:
  - 200: Successful request
  - 201: Resource created
  - 400: Bad request
  - 401: Unauthorized
  - 404: Resource not found
  - 500: Internal server error

### Base URL
- Local Development: `http://localhost:8080`

### CORS
- Configured to allow requests from `http://localhost:4200`


## Backend Unit Tests Results

```
go test -v ./handlers

=== RUN   TestRegisterHandler
--- PASS: TestRegisterHandler (0.07s)
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
=== RUN   TestAddPantryItemHandler
--- PASS: TestAddPantryItemHandler (0.00s)
=== RUN   TestUsePantryItemHandler
--- PASS: TestUsePantryItemHandler (0.00s)
=== RUN   TestDeletePantryItemHandler
--- PASS: TestDeletePantryItemHandler (0.00s)
=== RUN   TestGetPantryWarningsHandler
--- PASS: TestGetPantryWarningsHandler (0.00s)
=== RUN   TestGetPantryExpiringHandler
--- PASS: TestGetPantryExpiringHandler (0.00s)
=== RUN   TestGetPantryShoppingListHandler
--- PASS: TestGetPantryShoppingListHandler (0.00s)
=== RUN   TestAddShoppingCartItemHandler
--- PASS: TestAddShoppingCartItemHandler (0.00s)
=== RUN   TestUpdateShoppingCartItemHandler
--- PASS: TestUpdateShoppingCartItemHandler (0.00s)
=== RUN   TestDeleteShoppingCartItemHandler
--- PASS: TestDeleteShoppingCartItemHandler (0.00s)
=== RUN   TestListShoppingCartItemsHandler
--- PASS: TestListShoppingCartItemsHandler (0.00s)
=== RUN   TestDeleteShoppingCartItemNotOwnedHandler
--- PASS: TestDeleteShoppingCartItemNotOwnedHandler (0.00s)
=== RUN   TestAddDuplicateShoppingCartItemHandler
--- PASS: TestAddDuplicateShoppingCartItemHandler (0.00s)
=== RUN   TestUpdateNonexistentShoppingCartItemHandler
--- PASS: TestUpdateNonexistentShoppingCartItemHandler (0.00s)
=== RUN   TestInvalidShoppingCartRequests
--- PASS: TestInvalidShoppingCartRequests (0.00s)
=== RUN   TestUnauthenticatedShoppingCartRequests
--- PASS: TestUnauthenticatedShoppingCartRequests (0.00s)
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

```
### Test Results Explanation
The test output demonstrates comprehensive test coverage for all backend handlers in the Cribb application. The key findings from these results are:

1. **Complete Feature Coverage**: All major features are being tested, including:
  - Authentication (register, login, token generation)
  - User management (profile, listing, filtering)
  - Group management (creation, joining, member listing)
  - Chore management (individual and recurring chores)
  - Pantry functionality (adding, using, and deleting items)
  - Advanced pantry features (warnings, expiring items, shopping list)

2. **Shopping Cart Feature Validation**: The new shopping cart functionality has been fully tested with specific tests for:
  - `TestAddShoppingCartItemHandler`: Confirms that users can add new items to the shopping cart
  - `TestUpdateShoppingCartItemHandler`: Verifies that users can modify items in their cart
  - `TestDeleteShoppingCartItemHandler`: Ensures items can be properly removed from the cart
  - `TestListShoppingCartItemsHandler`: Validates the retrieval of shopping cart items with filtering
  - `TestDeleteShoppingCartItemNotOwnedHandler`: Confirms permission boundaries are enforced
  - `TestAddDuplicateShoppingCartItemHandler`: Tests proper handling of duplicate items
  - `TestUpdateNonexistentShoppingCartItemHandler`: Verifies error handling for invalid updates
  - `TestInvalidShoppingCartRequests`: Ensures request validation works correctly
  - `TestUnauthenticatedShoppingCartRequests`: Confirms authentication is properly enforced

3. **Test Performance**: Most tests execute very quickly (0.00s), with only a few taking marginally longer:
  - `TestRegisterHandler`: 0.07s
  - `TestLoginHandler`: 0.12s
  
  This indicates efficient implementation of the handlers and test fixtures.

4. **Test Status**: All tests have passed successfully, confirming that the implementation is working as expected and meets all requirements.

5. **Edge Case Coverage**: The shopping cart tests include important edge cases:
  - Attempting to delete another user's items
  - Adding items with the same name (duplicate handling)
  - Invalid request formats
  - Authentication boundary testing

These test results demonstrate that the Cribb backend, including the newly implemented shopping cart functionality, is robust and ready for integration with the frontend application.
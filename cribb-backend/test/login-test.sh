#!/bin/bash

# Comprehensive test script for Cribb backend API

# Set the base URL
BASE_URL="http://localhost:8080"

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility function for logging
log_request() {
  echo -e "${BLUE}==== $1 ====${NC}"
}

log_response() {
  if [ $1 -ge 200 ] && [ $1 -lt 300 ]; then
    echo -e "${GREEN}Status: $1${NC}"
  else
    echo -e "${RED}Status: $1${NC}"
  fi
  echo "Response: $2"
  echo "=================================="
}

# Global variables to store tokens and IDs
AUTH_TOKEN=""
USER_ID=""
GROUP_ID=""
CHORE_ID=""
RECURRING_CHORE_ID=""

# 1. User Registration Test
register_user() {
  log_request "REGISTER USER"
  REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/register" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "testuser123",
      "password": "testpassword",
      "name": "Test User",
      "phone_number": "1234567890",
      "room_number": "101"
    }')

  RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"

  # Extract user ID and auth token
  USER_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
  AUTH_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
}

# 2. Login Test
login_test() {
  log_request "LOGIN"
  LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "testuser123",
      "password": "testpassword"
    }')

  RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 3. Get User Profile Test
get_user_profile_test() {
  log_request "GET USER PROFILE"
  PROFILE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/users/profile" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  RESPONSE_BODY=$(echo "$PROFILE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$PROFILE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 4. Create Group Test
create_group_test() {
  log_request "CREATE GROUP"
  CREATE_GROUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/groups" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "name": "Test Apartment"
    }')

  RESPONSE_BODY=$(echo "$CREATE_GROUP_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$CREATE_GROUP_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"

  # Extract group ID
  GROUP_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
}

# 5. Join Group Test (already handled during registration)
get_group_members_test() {
  log_request "GET GROUP MEMBERS"
  MEMBERS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/groups/members?group_name=Test%20Apartment" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  RESPONSE_BODY=$(echo "$MEMBERS_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$MEMBERS_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 6. Create Individual Chore Test
create_individual_chore_test() {
  log_request "CREATE INDIVIDUAL CHORE"
  CREATE_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chores/individual" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "title": "Clean Kitchen",
      "description": "Wash dishes and wipe counters",
      "group_name": "Test Apartment",
      "assigned_to": "testuser123",
      "due_date": "'$(date -u -v+1d +"%Y-%m-%dT%H:%M:%SZ")'",
      "points": 10
    }')

  RESPONSE_BODY=$(echo "$CREATE_CHORE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$CREATE_CHORE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"

  # Extract chore ID
  CHORE_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
}

# 7. Get User Chores Test
get_user_chores_test() {
  log_request "GET USER CHORES"
  USER_CHORES_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/chores/user?username=testuser123" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  RESPONSE_BODY=$(echo "$USER_CHORES_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$USER_CHORES_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 8. Get Group Chores Test
get_group_chores_test() {
  log_request "GET GROUP CHORES"
  GROUP_CHORES_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/chores/group?group_name=Test%20Apartment" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  RESPONSE_BODY=$(echo "$GROUP_CHORES_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$GROUP_CHORES_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 9. Create Recurring Chore Test
create_recurring_chore_test() {
  log_request "CREATE RECURRING CHORE"
  CREATE_RECURRING_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chores/recurring" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "title": "Take Out Trash",
      "description": "Empty trash bins",
      "group_name": "Test Apartment",
      "frequency": "weekly",
      "points": 5
    }')

  RESPONSE_BODY=$(echo "$CREATE_RECURRING_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$CREATE_RECURRING_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"

  # Extract recurring chore ID
  RECURRING_CHORE_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
}

# 10. Get Group Recurring Chores Test
get_group_recurring_chores_test() {
  log_request "GET GROUP RECURRING CHORES"
  GROUP_RECURRING_CHORES_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/chores/group/recurring?group_name=Test%20Apartment" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  RESPONSE_BODY=$(echo "$GROUP_RECURRING_CHORES_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$GROUP_RECURRING_CHORES_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 11. Complete Chore Test
complete_chore_test() {
  log_request "COMPLETE CHORE"
  COMPLETE_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chores/complete" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "chore_id": "'$CHORE_ID'",
      "username": "testuser123"
    }')

  RESPONSE_BODY=$(echo "$COMPLETE_CHORE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$COMPLETE_CHORE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 12. Update Chore Test
update_chore_test() {
  log_request "UPDATE CHORE"
  UPDATE_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/chores/update" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "chore_id": "'$CHORE_ID'",
      "title": "Updated Clean Kitchen",
      "points": 15
    }')

  RESPONSE_BODY=$(echo "$UPDATE_CHORE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$UPDATE_CHORE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 13. Update Recurring Chore Test
update_recurring_chore_test() {
  log_request "UPDATE RECURRING CHORE"
  UPDATE_RECURRING_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/chores/recurring/update" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "recurring_chore_id": "'$RECURRING_CHORE_ID'",
      "title": "Updated Take Out Trash",
      "points": 7
    }')

  RESPONSE_BODY=$(echo "$UPDATE_RECURRING_CHORE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$UPDATE_RECURRING_CHORE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 14. Delete Chore Test
delete_chore_test() {
  log_request "DELETE CHORE"
  DELETE_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/chores/delete?chore_id=$CHORE_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  RESPONSE_BODY=$(echo "$DELETE_CHORE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$DELETE_CHORE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# 15. Delete Recurring Chore Test
delete_recurring_chore_test() {
  log_request "DELETE RECURRING CHORE"
  DELETE_RECURRING_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/api/chores/recurring/delete?recurring_chore_id=$RECURRING_CHORE_ID" \
    -H "Authorization: Bearer $AUTH_TOKEN")

  RESPONSE_BODY=$(echo "$DELETE_RECURRING_CHORE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$DELETE_RECURRING_CHORE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
}

# Execute all tests
main() {
  echo -e "${BLUE}Starting Cribb Backend API Comprehensive Tests${NC}"
  echo "=================================="

  # Run tests sequentially
  register_user
  login_test
  get_user_profile_test
  create_group_test
  get_group_members_test
  create_individual_chore_test
  get_user_chores_test
  get_group_chores_test
  create_recurring_chore_test
  get_group_recurring_chores_test
  complete_chore_test
  update_chore_test
  update_recurring_chore_test
  delete_chore_test
  delete_recurring_chore_test

  echo -e "${BLUE}All tests completed${NC}"
}

# Run the main test function
main
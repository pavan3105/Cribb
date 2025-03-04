#!/bin/bash

# Testing script for Cribb backend API with authentication
# This script tests user registration, login, group creation, and chore management

# Set the base URL
BASE_URL="http://localhost:8080"

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Cribb API Tests${NC}"
echo "=================================="

# Function to log requests and responses
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

# Store auth token
AUTH_TOKEN=""

# 1. Register a new user
log_request "REGISTER USER"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user189",
    "password": "password123",
    "name": "Test User",
    "phone_number": "7563899234"
  }')

# Extract status code and response body
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$REGISTER_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# 2. Login with the new user
log_request "LOGIN"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user189",
    "password": "password123"
  }')

# Extract status code and response body
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$LOGIN_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# Extract the token if login was successful
if [ $STATUS_CODE -eq 200 ]; then
  AUTH_TOKEN=$(echo "$RESPONSE_BODY" | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  echo -e "${GREEN}Extracted token: $AUTH_TOKEN${NC}"
  echo "=================================="
else
  echo -e "${RED}Failed to login. Cannot continue tests.${NC}"
  exit 1
fi

# 3. Create a new group (authenticated)
log_request "CREATE GROUP"
CREATE_GROUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/groups" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "name": "Apartment 6754"
  }')

# Extract status code and response body
RESPONSE_BODY=$(echo "$CREATE_GROUP_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$CREATE_GROUP_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# Extract the group ID if creation was successful
if [ $STATUS_CODE -eq 201 ]; then
  GROUP_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
  echo -e "${GREEN}Group created with ID: $GROUP_ID${NC}"
  echo "=================================="
else
  echo -e "${RED}Failed to create group. Continuing tests...${NC}"
fi

# 4. Join the group
log_request "JOIN GROUP"
JOIN_GROUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/groups/join" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "username": "user189",
    "group_name": "Apartment 6754"
  }')

# Extract status code and response body
RESPONSE_BODY=$(echo "$JOIN_GROUP_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$JOIN_GROUP_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# 5. Get group members
log_request "GET GROUP MEMBERS"
GET_MEMBERS_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/groups/members?group_name=Apartment%206754" \
  -H "Authorization: Bearer $AUTH_TOKEN")

# Extract status code and response body
RESPONSE_BODY=$(echo "$GET_MEMBERS_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$GET_MEMBERS_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# 6. Create an individual chore
log_request "CREATE INDIVIDUAL CHORE"
CREATE_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chores/individual" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "Clean Kitchen",
    "description": "Clean counters and sink",
    "group_name": "Apartment 6754",
    "assigned_to": "user189",
    "due_date": "'$(date -u -v+1d +"%Y-%m-%dT%H:%M:%SZ")'",
    "points": 10
  }')

# Extract status code and response body
RESPONSE_BODY=$(echo "$CREATE_CHORE_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$CREATE_CHORE_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# Extract the chore ID if creation was successful
if [ $STATUS_CODE -eq 201 ]; then
  CHORE_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
  echo -e "${GREEN}Chore created with ID: $CHORE_ID${NC}"
  echo "=================================="
else
  echo -e "${RED}Failed to create chore. Continuing tests...${NC}"
fi

# 7. Get user's chores
log_request "GET USER CHORES"
GET_CHORES_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/chores/user?username=user189" \
  -H "Authorization: Bearer $AUTH_TOKEN")

# Extract status code and response body
RESPONSE_BODY=$(echo "$GET_CHORES_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$GET_CHORES_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# 8. Complete a chore (if we have a chore ID)
if [ ! -z "$CHORE_ID" ]; then
  log_request "COMPLETE CHORE"
  COMPLETE_CHORE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chores/complete" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d '{
      "chore_id": "'$CHORE_ID'",
      "username": "user189"
    }')

  # Extract status code and response body
  RESPONSE_BODY=$(echo "$COMPLETE_CHORE_RESPONSE" | head -n 1)
  STATUS_CODE=$(echo "$COMPLETE_CHORE_RESPONSE" | tail -n 1)

  log_response $STATUS_CODE "$RESPONSE_BODY"
fi

# 9. Create a recurring chore
log_request "CREATE RECURRING CHORE"
CREATE_RECURRING_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/chores/recurring" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "title": "Take Out Trash",
    "description": "Take trash to dumpster",
    "group_name": "Apartment 6754",
    "frequency": "weekly",
    "points": 5
  }')

# Extract status code and response body
RESPONSE_BODY=$(echo "$CREATE_RECURRING_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$CREATE_RECURRING_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# Extract the recurring chore ID if creation was successful
if [ $STATUS_CODE -eq 201 ]; then
  RECURRING_CHORE_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*' | sed 's/"id":"//')
  echo -e "${GREEN}Recurring chore created with ID: $RECURRING_CHORE_ID${NC}"
  echo "=================================="
else
  echo -e "${RED}Failed to create recurring chore. Continuing tests...${NC}"
fi

# 10. Get group's recurring chores
log_request "GET GROUP RECURRING CHORES"
GET_RECURRING_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/chores/group/recurring?group_name=Apartment%206754" \
  -H "Authorization: Bearer $AUTH_TOKEN")

# Extract status code and response body
RESPONSE_BODY=$(echo "$GET_RECURRING_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$GET_RECURRING_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# 11. Test authentication failure (bad token)
log_request "TEST AUTH FAILURE"
BAD_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/users" \
  -H "Authorization: Bearer invalidtoken123")

# Extract status code and response body
RESPONSE_BODY=$(echo "$BAD_AUTH_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$BAD_AUTH_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# 12. Test login failure (wrong password)
log_request "TEST LOGIN FAILURE"
FAILED_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user189",
    "password": "wrongpassword"
  }')

# Extract status code and response body
RESPONSE_BODY=$(echo "$FAILED_LOGIN_RESPONSE" | head -n 1)
STATUS_CODE=$(echo "$FAILED_LOGIN_RESPONSE" | tail -n 1)

log_response $STATUS_CODE "$RESPONSE_BODY"

# Summary
echo -e "${BLUE}Test Summary${NC}"
echo "=================================="
echo "- Created user: user189"
echo "- Created group: Apartment 6754"
echo "- Created individual chore: Clean Kitchen"
echo "- Created recurring chore: Take Out Trash"
echo "- Tested authentication and authorization"
echo -e "${BLUE}Tests completed${NC}"
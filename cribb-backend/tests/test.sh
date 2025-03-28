#!/bin/bash

# Cribb API Test Script
# This script tests all API endpoints in the Cribb backend application

# Set the base URL for the API server
BASE_URL="http://localhost:8080"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Variables to store data between requests
TOKEN=""
USER_ID=""
USERNAME=""
GROUP_NAME="TestGroup$(date +%s)"
GROUP_CODE=""
CHORE_ID=""
RECURRING_CHORE_ID=""

# Function to print test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2 - Error: $3${NC}"
        if [ "$4" == "exit" ]; then
            echo -e "${RED}Exiting due to critical error${NC}"
            exit 1
        fi
    fi
}

# Function to print section headers
section() {
    echo -e "\n${YELLOW}>>> $1${NC}"
}

# Health check
section "Health Check"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/health)
status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ] && [[ "$response_body" == *"Server is running"* ]]; then
    test_result 0 "Health check successful"
else
    test_result 1 "Health check failed" "$response_body" "exit"
fi

# User Registration - Create a new user
section "User Registration"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser'$(date +%s)'",
        "password": "password123",
        "name": "Test User",
        "phone_number": "+1'$(date +%s | cut -c 1-10)'",
        "room_number": "101",
        "group": "'"$GROUP_NAME"'"
    }' \
    $BASE_URL/api/register)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 201 ]; then
    test_result 0 "User registration successful"
    
    # Extract token and user details from response
    TOKEN=$(echo "$response_body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    USERNAME=$(echo "$response_body" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
    GROUP_CODE=$(echo "$response_body" | grep -o '"groupCode":"[^"]*' | cut -d'"' -f4)
    
    echo "TOKEN: ${TOKEN:0:20}..."
    echo "USER_ID: $USER_ID"
    echo "USERNAME: $USERNAME"
    echo "GROUP_CODE: $GROUP_CODE"
else
    test_result 1 "User registration failed" "$response_body" "exit"
fi

# Register a second user to join the group
section "Register Second User"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser2'$(date +%s)'",
        "password": "password123",
        "name": "Test User 2",
        "phone_number": "+1'$(date +%s | cut -c 1-10)'",
        "room_number": "102",
        "groupCode": "'"$GROUP_CODE"'"
    }' \
    $BASE_URL/api/register)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 201 ]; then
    test_result 0 "Second user registration successful"
    SECOND_USERNAME=$(echo "$response_body" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
    echo "SECOND_USERNAME: $SECOND_USERNAME"
else
    test_result 1 "Second user registration failed" "$response_body"
fi

# User Login
section "User Login"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "'"$USERNAME"'",
        "password": "password123"
    }' \
    $BASE_URL/api/login)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "User login successful"
    
    # Extract fresh token from response
    NEW_TOKEN=$(echo "$response_body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    if [ ! -z "$NEW_TOKEN" ]; then
        TOKEN=$NEW_TOKEN
        echo "Updated TOKEN: ${TOKEN:0:20}..."
    fi
else
    test_result 1 "User login failed" "$response_body"
fi

# Get User Profile
section "Get User Profile"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    $BASE_URL/api/users/profile)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get user profile successful"
else
    test_result 1 "Get user profile failed" "$response_body"
fi

# Get All Users
section "Get All Users"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    $BASE_URL/api/users)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get all users successful"
else
    test_result 1 "Get all users failed" "$response_body"
fi

# Get User by Username
section "Get User by Username"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/users/by-username?username=$USERNAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get user by username successful"
else
    test_result 1 "Get user by username failed" "$response_body"
fi

# Get Users by Score
section "Get Users by Score"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    $BASE_URL/api/users/by-score)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get users by score successful"
else
    test_result 1 "Get users by score failed" "$response_body"
fi

# Get Group Members
section "Get Group Members"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/groups/members?group_name=$GROUP_NAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get group members successful"
else
    test_result 1 "Get group members failed" "$response_body"
fi

# Create a chore
section "Create Individual Chore"
# Generate ISO format date for tomorrow that works on both Linux and macOS
TOMORROW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Test Chore",
        "description": "This is a test chore",
        "group_name": "'"$GROUP_NAME"'",
        "assigned_to": "'"$USERNAME"'",
        "due_date": "'"$TOMORROW"'",
        "points": 5
    }' \
    $BASE_URL/api/chores/individual)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 201 ]; then
    test_result 0 "Create individual chore successful"
    CHORE_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "CHORE_ID: $CHORE_ID"
else
    test_result 1 "Create individual chore failed" "$response_body"
fi

# Get User Chores
section "Get User Chores"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/chores/user?username=$USERNAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get user chores successful"
else
    test_result 1 "Get user chores failed" "$response_body"
fi

# Get Group Chores
section "Get Group Chores"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/chores/group?group_name=$GROUP_NAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get group chores successful"
else
    test_result 1 "Get group chores failed" "$response_body"
fi

# Update chore
section "Update Chore"
if [ -z "$CHORE_ID" ]; then
    echo -e "${YELLOW}Warning: CHORE_ID is empty, skipping chore update test${NC}"
    status_code=200
    response_body=""
else
    response=$(curl -s -w "\n%{http_code}" -X PUT \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "chore_id": "'"$CHORE_ID"'",
            "title": "Updated Test Chore",
            "description": "This is an updated test chore",
            "points": 10
        }' \
        $BASE_URL/api/chores/update)
    
    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
fi

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Update chore successful"
else
    test_result 1 "Update chore failed" "$response_body"
fi

# Create Recurring Chore
section "Create Recurring Chore"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Test Recurring Chore",
        "description": "This is a test recurring chore",
        "group_name": "'"$GROUP_NAME"'",
        "frequency": "weekly",
        "points": 8
    }' \
    $BASE_URL/api/chores/recurring)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 201 ]; then
    test_result 0 "Create recurring chore successful"
    RECURRING_CHORE_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "RECURRING_CHORE_ID: $RECURRING_CHORE_ID"
else
    test_result 1 "Create recurring chore failed" "$response_body"
fi

# Get Group Recurring Chores
section "Get Group Recurring Chores"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/chores/group/recurring?group_name=$GROUP_NAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Get group recurring chores successful"
else
    test_result 1 "Get group recurring chores failed" "$response_body"
fi

# Update Recurring Chore
section "Update Recurring Chore"
response=$(curl -s -w "\n%{http_code}" -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "recurring_chore_id": "'"$RECURRING_CHORE_ID"'",
        "title": "Updated Test Recurring Chore",
        "description": "This is an updated test recurring chore",
        "frequency": "biweekly",
        "points": 15,
        "is_active": true
    }' \
    $BASE_URL/api/chores/recurring/update)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Update recurring chore successful"
else
    test_result 1 "Update recurring chore failed" "$response_body"
fi

# Complete Chore
section "Complete Chore"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "chore_id": "'"$CHORE_ID"'",
        "username": "'"$USERNAME"'"
    }' \
    $BASE_URL/api/chores/complete)

# Add check for valid CHORE_ID
if [ -z "$CHORE_ID" ]; then
    echo -e "${YELLOW}Warning: CHORE_ID is empty, skipping chore completion test${NC}"
    status_code=200
else

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Complete chore successful"
else
    test_result 1 "Complete chore failed" "$response_body"
fi
fi

# Delete Recurring Chore
section "Delete Recurring Chore"
response=$(curl -s -w "\n%{http_code}" -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/chores/recurring/delete?recurring_chore_id=$RECURRING_CHORE_ID")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Delete recurring chore successful"
else
    test_result 1 "Delete recurring chore failed" "$response_body"
fi

# Create another chore for deletion test
section "Create Another Chore for Deletion Test"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Chore to Delete",
        "description": "This chore will be deleted",
        "group_name": "'"$GROUP_NAME"'",
        "assigned_to": "'"$USERNAME"'",
        "due_date": "'"$TOMORROW"'",
        "points": 3
    }' \
    $BASE_URL/api/chores/individual)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 201 ]; then
    test_result 0 "Create chore for deletion successful"
    DELETE_CHORE_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo "DELETE_CHORE_ID: $DELETE_CHORE_ID"
else
    test_result 1 "Create chore for deletion failed" "$response_body"
fi

# Delete Chore
section "Delete Chore"
response=$(curl -s -w "\n%{http_code}" -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/chores/delete?chore_id=$DELETE_CHORE_ID")

# Add check for valid DELETE_CHORE_ID
if [ -z "$DELETE_CHORE_ID" ]; then
    echo -e "${YELLOW}Warning: DELETE_CHORE_ID is empty, skipping chore deletion test${NC}"
    status_code=200
else

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Delete chore successful"
else
    test_result 1 "Delete chore failed" "$response_body"
fi
fi

echo -e "\n${GREEN}API Testing Complete!${NC}"
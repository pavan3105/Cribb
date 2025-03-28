#!/bin/bash

# Pantry API Test Script
# This script tests the pantry API endpoints in the Cribb backend application

# Set the base URL for the API server
BASE_URL="http://localhost:8080"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables to store data between requests
TOKEN=""
USER_ID=""
USERNAME=""
GROUP_NAME="PantryTestGroup$(date +%s)"
GROUP_CODE=""
MILK_ID=""
BREAD_ID=""

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

# Function to print JSON in a readable format
pretty_json() {
    # If jq is installed, use it, otherwise use Python
    if command -v jq &> /dev/null; then
        echo "$1" | jq .
    elif command -v python3 &> /dev/null; then
        echo "$1" | python3 -m json.tool
    elif command -v python &> /dev/null; then
        echo "$1" | python -m json.tool
    else
        echo "$1"
    fi
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

# User Registration - Create a new user with a new group
section "User Registration"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "pantryuser'$(date +%s)'",
        "password": "password123",
        "name": "Pantry User",
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
    
    echo -e "${BLUE}TOKEN: ${TOKEN:0:20}...${NC}"
    echo -e "${BLUE}USER_ID: $USER_ID${NC}"
    echo -e "${BLUE}USERNAME: $USERNAME${NC}"
    echo -e "${BLUE}GROUP_CODE: $GROUP_CODE${NC}"
    echo -e "${BLUE}GROUP_NAME: $GROUP_NAME${NC}"
else
    test_result 1 "User registration failed" "$response_body" "exit"
fi

# Add Milk to pantry
section "Add Milk to Pantry"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Milk",
        "quantity": 2,
        "unit": "gallons",
        "category": "Dairy",
        "expiration_date": "'$(date -d "+10 days" +%Y-%m-%dT%H:%M:%SZ)'",
        "group_name": "'"$GROUP_NAME"'"
    }' \
    $BASE_URL/api/pantry/add)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Added Milk to pantry"
    MILK_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}MILK_ID: $MILK_ID${NC}"
    echo "Item details:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to add Milk to pantry" "$response_body"
fi

# Add Bread to pantry
section "Add Bread to Pantry"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Bread",
        "quantity": 3,
        "unit": "loaves",
        "category": "Bakery",
        "expiration_date": "'$(date -d "+5 days" +%Y-%m-%dT%H:%M:%SZ)'",
        "group_name": "'"$GROUP_NAME"'"
    }' \
    $BASE_URL/api/pantry/add)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Added Bread to pantry"
    BREAD_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}BREAD_ID: $BREAD_ID${NC}"
    echo "Item details:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to add Bread to pantry" "$response_body"
fi

# Add nearly expired Yogurt to pantry
section "Add Nearly-Expired Yogurt to Pantry"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Yogurt",
        "quantity": 5,
        "unit": "cups",
        "category": "Dairy",
        "expiration_date": "'$(date -d "+2 days" +%Y-%m-%dT%H:%M:%SZ)'",
        "group_name": "'"$GROUP_NAME"'"
    }' \
    $BASE_URL/api/pantry/add)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Added Yogurt to pantry"
    YOGURT_ID=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}YOGURT_ID: $YOGURT_ID${NC}"
    echo "Item details:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to add Yogurt to pantry" "$response_body"
fi

# List all pantry items
section "List All Pantry Items"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/pantry/list?group_name=$GROUP_NAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Listed all pantry items"
    echo "Pantry items:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to list pantry items" "$response_body"
fi

# List items in Dairy category
section "List Pantry Items in Dairy Category"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/pantry/list?group_name=$GROUP_NAME&category=Dairy")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Listed pantry items in Dairy category"
    echo "Dairy items:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to list dairy items" "$response_body"
fi

# Use some milk
section "Use Milk from Pantry"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "item_id": "'"$MILK_ID"'",
        "quantity": 0.5
    }' \
    $BASE_URL/api/pantry/use)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Used milk from pantry"
    echo "Result:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to use milk" "$response_body"
fi

# List items after using milk
section "List Items After Using Milk"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/pantry/list?group_name=$GROUP_NAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Listed items after using milk"
    echo "Updated pantry items:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to list updated items" "$response_body"
fi

# Use all remaining milk
section "Use All Remaining Milk"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "item_id": "'"$MILK_ID"'",
        "quantity": 1.5
    }' \
    $BASE_URL/api/pantry/use)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Used all remaining milk"
    echo "Result:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to use all milk" "$response_body"
fi

# Delete bread
section "Delete Bread from Pantry"
response=$(curl -s -w "\n%{http_code}" -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/pantry/remove/$BREAD_ID")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Deleted bread from pantry"
    echo "Result:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to delete bread" "$response_body"
fi

# List final pantry state
section "Final Pantry State"
response=$(curl -s -w "\n%{http_code}" -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BASE_URL/api/pantry/list?group_name=$GROUP_NAME")

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 200 ]; then
    test_result 0 "Listed final pantry state"
    echo "Final pantry items:"
    pretty_json "$response_body"
else
    test_result 1 "Failed to list final items" "$response_body"
fi

# Register a second user
section "Register Second User"
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "username": "pantryuser2'$(date +%s)'",
        "password": "password123",
        "name": "Pantry User 2",
        "phone_number": "+2'$(date +%s | cut -c 1-10)'",
        "room_number": "102",
        "groupCode": "'"$GROUP_CODE"'"
    }' \
    $BASE_URL/api/register)

status_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | sed '$d')

if [ "$status_code" -eq 201 ]; then
    test_result 0 "Second user registration successful"
    
    # Extract token and user details from response
    TOKEN2=$(echo "$response_body" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID2=$(echo "$response_body" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    USERNAME2=$(echo "$response_body" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
    
    echo -e "${BLUE}TOKEN2: ${TOKEN2:0:20}...${NC}"
    echo -e "${BLUE}USER_ID2: $USER_ID2${NC}"
    echo -e "${BLUE}USERNAME2: $USERNAME2${NC}"
    
    # Test that the second user can access the pantry
    section "Second User Access to Pantry"
    response=$(curl -s -w "\n%{http_code}" -X GET \
        -H "Authorization: Bearer $TOKEN2" \
        "$BASE_URL/api/pantry/list?group_name=$GROUP_NAME")

    status_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')

    if [ "$status_code" -eq 200 ]; then
        test_result 0 "Second user can access pantry"
        echo "Pantry items visible to second user:"
        pretty_json "$response_body"
    else
        test_result 1 "Second user cannot access pantry" "$response_body"
    fi
else
    test_result 1 "Second user registration failed" "$response_body"
fi

echo -e "\n${GREEN}Pantry API Testing Complete!${NC}"
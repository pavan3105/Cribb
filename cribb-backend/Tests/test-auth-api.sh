#!/bin/bash

# Register a new user
echo "==== Registering a new user ===="
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser95","password":"password123","name":"John Doe","phone_number":"2346787234"}'
echo -e "\n"

# Login with the new user
echo "==== Logging in ===="
LOGIN_RESPONSE=$(curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser95","password":"password123"}')
echo $LOGIN_RESPONSE | jq '.'
echo -e "\n"

# Extract token from login response (requires jq)
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
echo "Token: $TOKEN"
echo -e "\n"

# Refresh token
echo "==== Refreshing token ===="
REFRESH_RESPONSE=$(curl -X POST http://localhost:8080/api/refresh-token \
  -H "Authorization: Bearer $TOKEN")
echo $REFRESH_RESPONSE | jq '.'
echo -e "\n"

# Update token with refreshed one
TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.token')
echo "New Token: $TOKEN"
echo -e "\n"

# Get all users (authenticated)
echo "==== Getting all users ===="
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Get user by username (authenticated)
echo "==== Getting user by username ===="
curl -X GET "http://localhost:8080/api/users/by-username?username=testuser95" \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Create a group (authenticated)
echo "==== Creating a group ===="
curl -X POST http://localhost:8080/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Apartment 4290"}'
echo -e "\n"

# Join a group (authenticated)
echo "==== Joining a group ===="
curl -X POST http://localhost:8080/api/groups/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"username":"testuser95","group_name":"Apartment 4290"}'
echo -e "\n"

# Create a chore (authenticated)
echo "==== Creating a chore ===="
curl -X POST http://localhost:8080/api/chores/individual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Clean Kitchen","description":"Wipe counters and mop floor","group_name":"Apartment 4290","assigned_to":"testuser95","due_date":"2025-03-10T15:00:00Z","points":5}'
echo -e "\n"

# Logout (invalidate token)
echo "==== Logging out ===="
curl -X POST http://localhost:8080/api/logout \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test accessing protected endpoint after logout (should fail)
echo "==== Testing access after logout (should fail) ===="
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

# Test login with invalid credentials
echo "==== Testing invalid login ===="
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser95","password":"wrongpassword"}'
echo -e "\n"
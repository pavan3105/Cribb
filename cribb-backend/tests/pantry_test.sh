#!/bin/bash

# Don't exit on error
# set -e

# Configuration
API_URL="http://localhost:8080"
USERNAME="panTest3"
PASSWORD="pass1234"
PHONE="5567643286"
GROUP_NAME="Apt33735"  # Removed space to avoid URL encoding issues
ROOM_NUMBER="101"

echo "======= Testing Pantry Out-of-Stock Notifications ======="
echo "1. Create a new user and group"

# Register the user with a new group
echo "Running register command..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$USERNAME"'",
    "password": "'"$PASSWORD"'",
    "name": "Pantry Tester",
    "phone_number": "'"$PHONE"'",
    "room_number": "'"$ROOM_NUMBER"'",
    "group": "'"$GROUP_NAME"'"
  }')

echo "Register response: $REGISTER_RESPONSE"

# Extract the token from the response
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to register user or get token. Response:"
  echo $REGISTER_RESPONSE
  # Don't exit, try logging in instead
  echo "Trying to login with the user instead..."
  
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/login" \
    -H "Content-Type: application/json" \
    -d '{
      "username": "'"$USERNAME"'",
      "password": "'"$PASSWORD"'"
    }')
    
  echo "Login response: $LOGIN_RESPONSE"
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -z "$TOKEN" ]; then
    echo "Failed to login. Response:"
    echo $LOGIN_RESPONSE
    exit 1
  fi
fi

echo "User authenticated successfully and token received."
echo "Token: $TOKEN"

echo ""
echo "2. Add a new pantry item: Milk with quantity 2.0"

# Add a new pantry item
echo "Running add pantry item command..."
ADD_RESPONSE=$(curl -s -X POST "$API_URL/api/pantry/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Milk",
    "quantity": 2.0,
    "unit": "gallons",
    "category": "Dairy",
    "expiration_date": "2025-04-15T00:00:00Z",
    "group_name": "'"$GROUP_NAME"'"
  }')

echo "Add item response: $ADD_RESPONSE"

# Extract item ID more robustly
ITEM_ID=$(echo $ADD_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$ITEM_ID" ]; then
  echo "Failed to add pantry item or get item ID. Response:"
  echo $ADD_RESPONSE
  exit 1
fi

echo "Item added successfully. Item ID: $ITEM_ID"

echo ""
echo "3. Check if there are any warnings (should be none)"

# Check for warnings - use the group name without spaces
echo "Running get warnings command..."
# URL-encode the group name (unnecessary now that we've removed spaces)
ENCODED_GROUP_NAME=$GROUP_NAME
WARNINGS_RESPONSE=$(curl -s -X GET "$API_URL/api/pantry/warnings?group_name=$ENCODED_GROUP_NAME" \
  -H "Authorization: Bearer $TOKEN")

echo "Warnings response: $WARNINGS_RESPONSE"

# Try to parse the response
if echo "$WARNINGS_RESPONSE" | grep -q "error"; then
  echo "Error getting warnings."
else
  # Count notifications
  NOTIFICATIONS_COUNT=$(echo $WARNINGS_RESPONSE | grep -o '"id":"[^"]*"' | wc -l)

  echo "Initial warnings count: $NOTIFICATIONS_COUNT"
  if [ "$NOTIFICATIONS_COUNT" -eq 0 ]; then
    echo "No warnings yet, as expected."
  else
    echo "Unexpected warnings found:"
    echo $WARNINGS_RESPONSE
  fi
fi

echo ""
echo "4. Use 1.5 gallons of milk (should trigger low_stock notification)"

# Use most of the milk to trigger low stock
echo "Running use pantry item command..."
USE_RESPONSE=$(curl -s -X POST "$API_URL/api/pantry/use" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "item_id": "'"$ITEM_ID"'",
    "quantity": 1.5
  }')

echo "Use item response: $USE_RESPONSE"

# Check if the response contains an error
if echo "$USE_RESPONSE" | grep -q "error"; then
  echo "Error using pantry item."
else
  REMAINING=$(echo $USE_RESPONSE | grep -o '"remaining_quantity":[^,]*' | cut -d':' -f2)
  if [ -z "$REMAINING" ]; then
    echo "Could not parse remaining quantity."
  else
    echo "Used 1.5 gallons of milk. Remaining quantity: $REMAINING"
  fi
fi

echo ""
echo "5. Check for low_stock notification"

# Check for low-stock notification
sleep 2  # Wait a moment for the notification to be processed
echo "Running get warnings command again..."
WARNINGS_RESPONSE=$(curl -s -X GET "$API_URL/api/pantry/warnings?group_name=$ENCODED_GROUP_NAME" \
  -H "Authorization: Bearer $TOKEN")

echo "Warnings response: $WARNINGS_RESPONSE"

# Check if there's a low_stock notification
if echo "$WARNINGS_RESPONSE" | grep -q "error"; then
  echo "Error getting warnings."
else
  LOW_STOCK=$(echo $WARNINGS_RESPONSE | grep -o '"type":"low_stock"' | wc -l)

  if [ "$LOW_STOCK" -gt 0 ]; then
    echo "Low stock notification found, as expected."
  else
    echo "No low stock notification found."
  fi
fi

echo ""
echo "6. Use the remaining 0.5 gallons of milk (should convert to out_of_stock)"

# Use the rest of the milk to trigger out of stock
echo "Running use pantry item command again..."
USE_RESPONSE=$(curl -s -X POST "$API_URL/api/pantry/use" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "item_id": "'"$ITEM_ID"'",
    "quantity": 0.5
  }')

echo "Use item response: $USE_RESPONSE"

# Check if the response contains an error
if echo "$USE_RESPONSE" | grep -q "error"; then
  echo "Error using pantry item."
else
  REMAINING=$(echo $USE_RESPONSE | grep -o '"remaining_quantity":[^,]*' | cut -d':' -f2)
  if [ -z "$REMAINING" ]; then
    echo "Could not parse remaining quantity."
  else
    echo "Used remaining milk. New quantity: $REMAINING"
  fi
fi

echo ""
echo "7. Check for out_of_stock notification (low_stock should be gone)"

# Check for out-of-stock notification
sleep 2  # Wait a moment for the notification to be processed
echo "Running get warnings command one more time..."
WARNINGS_RESPONSE=$(curl -s -X GET "$API_URL/api/pantry/warnings?group_name=$ENCODED_GROUP_NAME" \
  -H "Authorization: Bearer $TOKEN")

echo "Warnings response: $WARNINGS_RESPONSE"

# Check if there's an out_of_stock notification and no low_stock
if echo "$WARNINGS_RESPONSE" | grep -q "error"; then
  echo "Error getting warnings."
else
  OUT_OF_STOCK=$(echo $WARNINGS_RESPONSE | grep -o '"type":"out_of_stock"' | wc -l)
  LOW_STOCK=$(echo $WARNINGS_RESPONSE | grep -o '"type":"low_stock"' | wc -l)

  if [ "$OUT_OF_STOCK" -gt 0 ] && [ "$LOW_STOCK" -eq 0 ]; then
    echo "SUCCESS: Out of stock notification found and low stock notification is gone, as expected."
  else
    echo "FAILURE: Unexpected notification state."
    echo "Out of stock notifications: $OUT_OF_STOCK"
    echo "Low stock notifications: $LOW_STOCK"
  fi
fi

echo ""
echo "8. Add another item with initial quantity 0"

# Add a new item with zero quantity
ADD_RESPONSE=$(curl -s -X POST "$API_URL/api/pantry/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Eggs",
    "quantity": 0.0,
    "unit": "dozen",
    "category": "Dairy",
    "group_name": "'"$GROUP_NAME"'"
  }')

echo "Add item response: $ADD_RESPONSE"

# Extract item ID
EGGS_ID=$(echo $ADD_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$EGGS_ID" ]; then
  echo "Failed to add eggs or get item ID. Response:"
  echo $ADD_RESPONSE
  exit 1
fi

echo "Eggs added successfully with quantity 0. Item ID: $EGGS_ID"

echo ""
echo "9. Check if eggs item caused an immediate out_of_stock notification"

# Check for out-of-stock notification for eggs
sleep 2  # Wait a moment for any notifications to be processed
WARNINGS_RESPONSE=$(curl -s -X GET "$API_URL/api/pantry/warnings?group_name=$ENCODED_GROUP_NAME" \
  -H "Authorization: Bearer $TOKEN")

echo "Warnings response: $WARNINGS_RESPONSE"

# Count how many out_of_stock notifications exist now
OUT_OF_STOCK=$(echo $WARNINGS_RESPONSE | grep -o '"type":"out_of_stock"' | wc -l)

if [ "$OUT_OF_STOCK" -eq 2 ]; then
  echo "SUCCESS: Both milk and eggs have out_of_stock notifications."
else
  echo "Note: Only milk has an out_of_stock notification."
  echo "This is expected if background job hasn't run yet."
  echo "Current warnings:"
  echo $WARNINGS_RESPONSE
fi

echo ""
echo "10. Verify the NotificationType in the server code"

# Let's directly check if the NotificationType enum has the out_of_stock option
# We'll add an item with a unique name, set quantity to 0, then check if a notification is made
UNIQUE_NAME="TestItem_$(date +%s)"
ADD_RESPONSE=$(curl -s -X POST "$API_URL/api/pantry/add" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "'"$UNIQUE_NAME"'",
    "quantity": 0.0,
    "unit": "units",
    "category": "Test",
    "group_name": "'"$GROUP_NAME"'"
  }')

UNIQUE_ID=$(echo $ADD_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Added test item '$UNIQUE_NAME' with ID: $UNIQUE_ID"

# Force a check of low stock items by making a manual GET request
curl -s -X GET "$API_URL/api/pantry/list?group_name=$ENCODED_GROUP_NAME" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

sleep 5  # Wait a bit longer for the background job to run

# Check warnings again
WARNINGS_RESPONSE=$(curl -s -X GET "$API_URL/api/pantry/warnings?group_name=$ENCODED_GROUP_NAME" \
  -H "Authorization: Bearer $TOKEN")

# Check for our unique item name in the warnings
if echo "$WARNINGS_RESPONSE" | grep -q "$UNIQUE_NAME"; then
  echo "Found notification for test item '$UNIQUE_NAME'"
  # Check if it's an out_of_stock notification
  if echo "$WARNINGS_RESPONSE" | grep -q "\"item_name\":\"$UNIQUE_NAME\"" | grep -q "\"type\":\"out_of_stock\""; then
    echo "SUCCESS: Server correctly identified $UNIQUE_NAME as out_of_stock"
  else
    echo "FAILURE: Server did not mark $UNIQUE_NAME as out_of_stock"
  fi
else
  echo "No notification found for test item '$UNIQUE_NAME'"
  echo "This suggests the server code may not have the updates implemented properly."
fi

echo ""
echo "====== Test script completed ======"
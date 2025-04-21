package handlers

import (
	"context"
	"cribb-backend/config"
	"cribb-backend/middleware"
	"cribb-backend/models"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// AddShoppingCartItemRequest defines the request structure for adding a shopping cart item
type AddShoppingCartItemRequest struct {
	ItemName string  `json:"item_name"`
	Quantity float64 `json:"quantity"`
}

// UpdateShoppingCartItemRequest defines the request structure for updating a shopping cart item
type UpdateShoppingCartItemRequest struct {
	ItemID   string  `json:"item_id"`
	ItemName string  `json:"item_name,omitempty"`
	Quantity float64 `json:"quantity,omitempty"`
}

// AddShoppingCartItemHandler handles adding an item to the shopping cart
func AddShoppingCartItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user from context (set by AuthMiddleware)
	userClaims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	var request AddShoppingCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if request.ItemName == "" || request.Quantity <= 0 {
		http.Error(w, "Item name and quantity are required. Quantity must be positive.", http.StatusBadRequest)
		return
	}

	// Get user ID
	userID, err := primitive.ObjectIDFromHex(userClaims.ID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Find user to get their group
	var user models.User
	err = config.DB.Collection("users").FindOne(
		context.Background(),
		bson.M{"_id": userID},
	).Decode(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch user", http.StatusInternalServerError)
		}
		return
	}

	// Create new shopping cart item
	shoppingCartItem := models.CreateShoppingCartItem(
		userID,
		user.GroupID,
		request.ItemName,
		request.Quantity,
	)

	// Use upsert to either insert a new item or update an existing one
	filter := bson.M{
		"user_id":   userID,
		"group_id":  user.GroupID,
		"item_name": request.ItemName,
	}

	update := bson.M{
		"$set": bson.M{
			"quantity": request.Quantity,
			"added_at": shoppingCartItem.AddedAt,
		},
	}

	opts := options.Update().SetUpsert(true)

	result, err := config.DB.Collection("shopping_cart").UpdateOne(
		context.Background(),
		filter,
		update,
		opts,
	)

	if err != nil {
		log.Printf("Failed to add/update shopping cart item: %v", err)
		http.Error(w, "Failed to add item to shopping cart", http.StatusInternalServerError)
		return
	}

	// If an item was inserted, set the ID
	if result.UpsertedID != nil {
		shoppingCartItem.ID = result.UpsertedID.(primitive.ObjectID)
	} else {
		// If an item was updated, fetch it to get the ID
		var existingItem models.ShoppingCartItem
		err = config.DB.Collection("shopping_cart").FindOne(
			context.Background(),
			filter,
		).Decode(&existingItem)

		if err == nil {
			shoppingCartItem.ID = existingItem.ID
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(shoppingCartItem)
}

// UpdateShoppingCartItemHandler handles updating an item in the shopping cart
func UpdateShoppingCartItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user from context (set by AuthMiddleware)
	userClaims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	var request UpdateShoppingCartItemRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if request.ItemID == "" {
		http.Error(w, "Item ID is required", http.StatusBadRequest)
		return
	}

	// Convert item ID to ObjectID
	itemID, err := primitive.ObjectIDFromHex(request.ItemID)
	if err != nil {
		http.Error(w, "Invalid item ID format", http.StatusBadRequest)
		return
	}

	// Get user ID
	userID, err := primitive.ObjectIDFromHex(userClaims.ID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Verify the item belongs to the user
	var shoppingCartItem models.ShoppingCartItem
	err = config.DB.Collection("shopping_cart").FindOne(
		context.Background(),
		bson.M{
			"_id":     itemID,
			"user_id": userID,
		},
	).Decode(&shoppingCartItem)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			http.Error(w, "Shopping cart item not found or does not belong to user", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch shopping cart item", http.StatusInternalServerError)
		}
		return
	}

	// Prepare update fields
	updateFields := bson.M{}

	// Only update fields that were provided
	if request.ItemName != "" {
		updateFields["item_name"] = request.ItemName
	}

	if request.Quantity > 0 {
		updateFields["quantity"] = request.Quantity
	}

	// If no fields to update, return early
	if len(updateFields) == 0 {
		http.Error(w, "No valid fields to update", http.StatusBadRequest)
		return
	}

	// Update the item
	_, err = config.DB.Collection("shopping_cart").UpdateOne(
		context.Background(),
		bson.M{"_id": itemID},
		bson.M{"$set": updateFields},
	)

	if err != nil {
		log.Printf("Failed to update shopping cart item: %v", err)
		http.Error(w, "Failed to update shopping cart item", http.StatusInternalServerError)
		return
	}

	// Get updated item
	err = config.DB.Collection("shopping_cart").FindOne(
		context.Background(),
		bson.M{"_id": itemID},
	).Decode(&shoppingCartItem)

	if err != nil {
		log.Printf("Failed to fetch updated shopping cart item: %v", err)
		http.Error(w, "Failed to fetch updated item", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(shoppingCartItem)
}

// DeleteShoppingCartItemHandler handles deleting an item from the shopping cart
func DeleteShoppingCartItemHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user from context (set by AuthMiddleware)
	userClaims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Get item ID from URL path
	itemIDStr := strings.TrimPrefix(r.URL.Path, "/api/shopping-cart/delete/")
	if itemIDStr == "" {
		http.Error(w, "Item ID is required", http.StatusBadRequest)
		return
	}

	// Convert item ID to ObjectID
	itemID, err := primitive.ObjectIDFromHex(itemIDStr)
	if err != nil {
		http.Error(w, "Invalid item ID format", http.StatusBadRequest)
		return
	}

	// Get user ID
	userID, err := primitive.ObjectIDFromHex(userClaims.ID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Delete the item if it belongs to the user
	result, err := config.DB.Collection("shopping_cart").DeleteOne(
		context.Background(),
		bson.M{
			"_id":     itemID,
			"user_id": userID,
		},
	)

	if err != nil {
		log.Printf("Failed to delete shopping cart item: %v", err)
		http.Error(w, "Failed to delete shopping cart item", http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, "Shopping cart item not found or does not belong to user", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Shopping cart item deleted successfully",
	})
}

// ListShoppingCartItemsHandler handles retrieving all items in the shopping cart for a group
func ListShoppingCartItemsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user from context (set by AuthMiddleware)
	userClaims, ok := middleware.GetUserFromContext(r.Context())
	if !ok {
		http.Error(w, "User not authenticated", http.StatusUnauthorized)
		return
	}

	// Get user ID
	userID, err := primitive.ObjectIDFromHex(userClaims.ID)
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Find user to get their group
	var user models.User
	err = config.DB.Collection("users").FindOne(
		context.Background(),
		bson.M{"_id": userID},
	).Decode(&user)

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			http.Error(w, "User not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch user", http.StatusInternalServerError)
		}
		return
	}

	// Check for filter by user
	filterByUser := r.URL.Query().Get("user_id")

	// Build the query filter
	filter := bson.M{"group_id": user.GroupID}

	// If filtering by user, add user_id to filter
	if filterByUser != "" {
		filterUserID, err := primitive.ObjectIDFromHex(filterByUser)
		if err != nil {
			http.Error(w, "Invalid filter user ID format", http.StatusBadRequest)
			return
		}
		filter["user_id"] = filterUserID
	}

	// Get all items in the shopping cart for the group
	opts := options.Find().SetSort(bson.D{{Key: "added_at", Value: -1}})
	cursor, err := config.DB.Collection("shopping_cart").Find(
		context.Background(),
		filter,
		opts,
	)

	if err != nil {
		log.Printf("Failed to fetch shopping cart items: %v", err)
		http.Error(w, "Failed to fetch shopping cart items", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var shoppingCartItems []models.ShoppingCartItem
	if err = cursor.All(context.Background(), &shoppingCartItems); err != nil {
		log.Printf("Failed to decode shopping cart items: %v", err)
		http.Error(w, "Failed to decode shopping cart items", http.StatusInternalServerError)
		return
	}

	// Return items with additional user info
	type ShoppingCartItemWithUser struct {
		models.ShoppingCartItem
		UserName string `json:"user_name"`
	}

	// Create a map of user IDs to user names
	userCache := make(map[string]string)

	// Prepare response with user names
	itemsWithUsers := make([]ShoppingCartItemWithUser, 0, len(shoppingCartItems))
	for _, item := range shoppingCartItems {
		userIDStr := item.UserID.Hex()
		userName, ok := userCache[userIDStr]

		if !ok {
			// Fetch user name if not in cache
			var itemUser models.User
			err := config.DB.Collection("users").FindOne(
				context.Background(),
				bson.M{"_id": item.UserID},
			).Decode(&itemUser)

			if err == nil {
				userName = itemUser.Name
				userCache[userIDStr] = userName
			} else {
				userName = "Unknown User"
			}
		}

		itemWithUser := ShoppingCartItemWithUser{
			ShoppingCartItem: item,
			UserName:         userName,
		}

		itemsWithUsers = append(itemsWithUsers, itemWithUser)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(itemsWithUsers)
}

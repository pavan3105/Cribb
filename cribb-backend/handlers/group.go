// handlers/group.go
package handlers

import (
	"context"
	"cribb-backend/config"
	"cribb-backend/models"
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"fmt"     // For formatted I/O
	"strings" // For string manipulation
	"time"    // For time-related operations

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options" // MongoDB options
)

// CreateGroupHandler creates a new group
// CreateGroupHandler creates a new group
func CreateGroupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var group models.Group
	if err := json.NewDecoder(r.Body).Decode(&group); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Initialize with proper defaults
	group = *models.NewGroup(group.Name)

	// Insert and get generated ID
	result, err := config.DB.Collection("groups").InsertOne(context.Background(), group)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			http.Error(w, "Group name already exists", http.StatusConflict)
		} else {
			log.Printf("Group creation error: %v", err)
			http.Error(w, "Failed to create group", http.StatusInternalServerError)
		}
		return
	}

	// Set generated ID from MongoDB
	group.ID = result.InsertedID.(primitive.ObjectID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(group)
}

func JoinGroupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var request struct {
		Username  string `json:"username"`
		GroupName string `json:"group_name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Start MongoDB session
	session, err := config.DB.Client().StartSession()
	if err != nil {
		log.Printf("Session start error: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer session.EndSession(context.Background())

	// Transaction handling
	err = mongo.WithSession(context.Background(), session, func(sc mongo.SessionContext) error {
		// 1. Fetch group with essential fields
		var group models.Group
		err := config.DB.Collection("groups").FindOne(
			sc,
			bson.M{"name": request.GroupName},
			options.FindOne().SetProjection(bson.M{"name": 1}),
		).Decode(&group)

		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return fmt.Errorf("group not found")
			}
			log.Printf("Group fetch error: %v", err)
			return fmt.Errorf("failed to fetch group")
		}

		// 2. Fetch user with essential fields
		var user models.User
		err = config.DB.Collection("users").FindOne(
			sc,
			bson.M{"username": request.Username},
			options.FindOne().SetProjection(bson.M{"_id": 1}),
		).Decode(&user)

		if err != nil {
			if errors.Is(err, mongo.ErrNoDocuments) {
				return fmt.Errorf("user not found")
			}
			log.Printf("User fetch error: %v", err)
			return fmt.Errorf("failed to fetch user")
		}

		// 3. Update user document
		userUpdate := bson.M{
			"$set": bson.M{
				"group":      group.Name,
				"group_id":   group.ID,
				"updated_at": time.Now(),
			},
		}
		userRes, err := config.DB.Collection("users").UpdateByID(
			sc,
			user.ID,
			userUpdate,
			options.Update().SetUpsert(false),
		)
		if err != nil {
			log.Printf("User update error: %v", err)
			return fmt.Errorf("failed to update user group")
		}
		if userRes.MatchedCount == 0 {
			return fmt.Errorf("user document not found")
		}

		// 4. Update group members array
		groupUpdate := bson.M{
			"$addToSet": bson.M{"members": user.ID},
			"$set":      bson.M{"updated_at": time.Now()},
		}
		groupRes, err := config.DB.Collection("groups").UpdateByID(
			sc,
			group.ID,
			groupUpdate,
		)
		if err != nil {
			log.Printf("Group members update error: %v", err)
			return fmt.Errorf("failed to update group members: %v", err)
		}
		if groupRes.MatchedCount == 0 {
			return fmt.Errorf("group document not found")
		}

		return nil
	})

	// Handle transaction result
	if err != nil {
		log.Printf("Transaction failed: %v", err)
		switch {
		case strings.Contains(err.Error(), "group not found"):
			http.Error(w, "Group not found", http.StatusNotFound)
		case strings.Contains(err.Error(), "user not found"):
			http.Error(w, "User not found", http.StatusNotFound)
		case strings.Contains(err.Error(), "user document not found"):
			http.Error(w, "User document not found", http.StatusNotFound)
		case strings.Contains(err.Error(), "group document not found"):
			http.Error(w, "Group document not found", http.StatusNotFound)
		default:
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
}

// GetGroupMembersHandler retrieves all members of a group
// GetGroupMembersHandler retrieves all members of a group by group name
func GetGroupMembersHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	groupName := r.URL.Query().Get("group_name")
	if groupName == "" {
		http.Error(w, "Group name is required", http.StatusBadRequest)
		return
	}

	// Fetch the group by name
	var group models.Group
	err := config.DB.Collection("groups").FindOne(context.Background(), bson.M{"name": groupName}).Decode(&group)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, "Group not found", http.StatusNotFound)
		} else {
			http.Error(w, "Failed to fetch group", http.StatusInternalServerError)
		}
		return
	}

	// Fetch all users in the group
	cursor, err := config.DB.Collection("users").Find(context.Background(), bson.M{"group_id": group.ID})
	if err != nil {
		http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	var users []models.User
	if err := cursor.All(context.Background(), &users); err != nil {
		http.Error(w, "Failed to decode users", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

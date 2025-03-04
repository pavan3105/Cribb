package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"cribb-backend/config"
	"cribb-backend/models"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type RegisterRequest struct {
	Username    string `json:"username"`
	Password    string `json:"password"`
	Name        string `json:"name"`
	PhoneNumber string `json:"phone_number"`
	RoomNumber  string `json:"room_number"`
}

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Username == "" || req.Password == "" || req.Name == "" || req.PhoneNumber == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create new user
	newUser := models.User{
		Username:    req.Username,
		Password:    string(hashedPassword),
		Name:        req.Name,
		PhoneNumber: req.PhoneNumber,
		RoomNumber:  req.RoomNumber,
		Score:       10,
		Group:       "",                    // Empty string for no group
		GroupID:     primitive.NilObjectID, // Proper null ObjectID
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	// Insert into database
	_, err = config.DB.Collection("users").InsertOne(context.Background(), newUser)
	if err != nil {
		if mongo.IsDuplicateKeyError(err) {
			http.Error(w, "Username or phone number already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to create user", http.StatusInternalServerError)
		return
	}

	// Return success message
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User created successfully",
	})
}

var jwtSecret = []byte("your_jwt_secret_key_here")

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// generateJWTToken creates a new JWT token for the authenticated user
func generateJWTToken(userID, username string) string {
	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":       userID,
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24 * 7).Unix(), // Token expires in 7 days
	})

	// Sign the token with our secret
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return ""
	}

	return tokenString
}

type UserData struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	FirstName  string `json:"firstName"`
	LastName   string `json:"lastName"`
	Phone      string `json:"phone"`
	RoomNumber string `json:"roomNo"`
}

type LoginResponse struct {
	Success bool     `json:"success"`
	Token   string   `json:"token"`
	User    UserData `json:"user"`
	Message string   `json:"message"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Username == "" || req.Password == "" {
		http.Error(w, "Username and password are required", http.StatusBadRequest)
		return
	}

	// Find user by username
	var user models.User
	err := config.DB.Collection("users").FindOne(
		context.Background(),
		bson.M{"username": req.Username},
	).Decode(&user)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Don't reveal whether username exists or not for security
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Failed to authenticate user", http.StatusInternalServerError)
		return
	}

	// Compare password hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		// Password doesn't match
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT token
	token := generateJWTToken(user.ID.Hex(), user.Username)

	// Split name into first and last name (assuming format is "FirstName LastName")
	nameParts := strings.Split(user.Name, " ")
	firstName := nameParts[0]
	lastName := ""
	if len(nameParts) > 1 {
		lastName = strings.Join(nameParts[1:], " ")
	}

	// Prepare response with user data (excluding password)
	response := LoginResponse{
		Success: true,
		Token:   token,
		User: UserData{
			ID:         user.ID.Hex(),
			Email:      user.Username, // Using username as email
			FirstName:  firstName,
			LastName:   lastName,
			Phone:      user.PhoneNumber,
			RoomNumber: user.RoomNumber,
		},
		Message: "Login successful",
	}

	// Return successful login response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

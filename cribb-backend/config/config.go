package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	DB        *mongo.Database
	JWTSecret []byte
)

// ConnectDB initializes MongoDB connection and sets up the database
func ConnectDB() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file:", err)
	}

	// Get and validate environment variables
	mongoURI := strings.TrimSpace(os.Getenv("MONGODB_URI"))
	dbName := strings.TrimSpace(os.Getenv("DB_NAME"))
	jwtSecret := strings.TrimSpace(os.Getenv("JWT_SECRET"))

	if mongoURI == "" {
		log.Fatal("MONGODB_URI is required in .env file")
	}

	if dbName == "" {
		log.Fatal("DB_NAME is required in .env file")
	}

	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is required in .env file")
	}

	// Set JWT secret
	JWTSecret = []byte(jwtSecret)

	log.Printf("Attempting to connect to MongoDB...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Connect to MongoDB
	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("Failed to ping MongoDB:", err)
	}

	DB = client.Database(dbName)

	// Initialize database collections and indexes
	if err := initializeDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	log.Printf("Successfully connected to MongoDB database: %s", dbName)
}

func initializeDatabase() error {
	if DB == nil {
		return fmt.Errorf("database connection not initialized")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	log.Println("Creating collections and indexes...")

	// Create users collection with indexes
	usersCollection := DB.Collection("users")
	usersIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "phone_number", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "score", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "room_number", Value: 1}},
		},
	}
	_, err := usersCollection.Indexes().CreateMany(ctx, usersIndexes)
	if err != nil {
		return fmt.Errorf("failed to create user indexes: %v", err)
	}

	// Create chores collection with indexes
	choresCollection := DB.Collection("chores")
	choresIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "group_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "assigned_to", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "status", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "due_date", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "recurring_id", Value: 1}},
		},
	}
	_, err = choresCollection.Indexes().CreateMany(ctx, choresIndexes)
	if err != nil {
		return fmt.Errorf("failed to create chore indexes: %v", err)
	}

	// Create recurring_chores collection with indexes
	recurringChoresCollection := DB.Collection("recurring_chores")
	recurringChoresIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "group_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "is_active", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "next_assignment", Value: 1}},
		},
	}
	_, err = recurringChoresCollection.Indexes().CreateMany(ctx, recurringChoresIndexes)
	if err != nil {
		return fmt.Errorf("failed to create recurring chore indexes: %v", err)
	}

	// Create chore_completions collection with indexes
	completionsCollection := DB.Collection("chore_completions")
	completionsIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{{Key: "chore_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "user_id", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "completed_at", Value: -1}},
		},
	}
	_, err = completionsCollection.Indexes().CreateMany(ctx, completionsIndexes)
	if err != nil {
		return fmt.Errorf("failed to create chore completion indexes: %v", err)
	}

	log.Println("Successfully initialized database collections and indexes")
	return nil
}

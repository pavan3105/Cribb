package main

import (
	"cribb-backend/config"
	"cribb-backend/handlers"
	"cribb-backend/jobs"
	"cribb-backend/middleware"
	"log"
	"net/http"
)

func main() {
	// Connect to MongoDB and initialize collections
	config.ConnectDB()

	// Start the background jobs
	jobs.StartChoreScheduler()
	jobs.StartPantryJobs() // Start the pantry background jobs

	// Register routes
	http.HandleFunc("/health", middleware.CORSMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Server is running!"))
	}))

	// Auth routes - apply CORS middleware to resolve login issue
	http.HandleFunc("/api/register", middleware.CORSMiddleware(handlers.RegisterHandler))
	http.HandleFunc("/api/login", middleware.CORSMiddleware(handlers.LoginHandler))

	// User routes - wrap existing middleware with CORS middleware
	http.HandleFunc("/api/users/profile", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetUserProfileHandler)))
	http.HandleFunc("/api/users", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetUsersHandler)))
	http.HandleFunc("/api/users/by-username", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetUserByUsernameHandler)))
	http.HandleFunc("/api/users/by-score", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetUsersByScoreHandler)))

	// Group routes - wrap existing middleware with CORS middleware
	http.HandleFunc("/api/groups", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.CreateGroupHandler)))
	http.HandleFunc("/api/groups/join", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.JoinGroupHandler)))
	http.HandleFunc("/api/groups/members", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetGroupMembersHandler)))

	// Chore routes - existing - wrap with CORS middleware
	http.HandleFunc("/api/chores/individual", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.CreateIndividualChoreHandler)))
	http.HandleFunc("/api/chores/recurring", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.CreateRecurringChoreHandler)))
	http.HandleFunc("/api/chores/user", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetUserChoresHandler)))

	// Chore routes - new - wrap with CORS middleware
	http.HandleFunc("/api/chores/complete", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.CompleteChoreHandler)))
	http.HandleFunc("/api/chores/group", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetGroupChoresHandler)))
	http.HandleFunc("/api/chores/group/recurring", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetGroupRecurringChoresHandler)))
	http.HandleFunc("/api/chores/update", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.UpdateChoreHandler)))
	http.HandleFunc("/api/chores/delete", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.DeleteChoreHandler)))
	http.HandleFunc("/api/chores/recurring/update", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.UpdateRecurringChoreHandler)))
	http.HandleFunc("/api/chores/recurring/delete", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.DeleteRecurringChoreHandler)))

	// Pantry routes - existing - wrap with CORS middleware
	http.HandleFunc("/api/pantry/add", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.AddPantryItemHandler)))
	http.HandleFunc("/api/pantry/use", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.UsePantryItemHandler)))
	http.HandleFunc("/api/pantry/list", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetPantryItemsHandler)))
	http.HandleFunc("/api/pantry/remove/", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.DeletePantryItemHandler)))

	// Pantry routes - new - wrap with CORS middleware
	http.HandleFunc("/api/pantry/warnings", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetPantryWarningsHandler)))
	http.HandleFunc("/api/pantry/expiring", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetPantryExpiringHandler)))
	http.HandleFunc("/api/pantry/shopping-list", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetPantryShoppingListHandler)))
	http.HandleFunc("/api/pantry/history", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.GetPantryHistoryHandler)))
	http.HandleFunc("/api/pantry/notify/read", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.MarkNotificationReadHandler)))
	http.HandleFunc("/api/pantry/notify/delete", middleware.CORSMiddleware(middleware.AuthMiddleware(handlers.DeleteNotificationHandler)))

	log.Println("Server starting on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

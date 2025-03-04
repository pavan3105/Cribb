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

	// Start the chore scheduler in the background
	jobs.StartChoreScheduler()

	// Register routes
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Server is running!"))
	})

	// Auth routes
	http.HandleFunc("/api/register", handlers.RegisterHandler)
	http.HandleFunc("/api/login", handlers.LoginHandler) // New login route

	// User routes - some protected, some public
	http.HandleFunc("/api/users", middleware.AuthMiddleware(handlers.GetUsersHandler))
	http.HandleFunc("/api/users/by-username", middleware.AuthMiddleware(handlers.GetUserByUsernameHandler))
	http.HandleFunc("/api/users/by-score", middleware.AuthMiddleware(handlers.GetUsersByScoreHandler))

	// Group routes - all protected
	http.HandleFunc("/api/groups", middleware.AuthMiddleware(handlers.CreateGroupHandler))
	http.HandleFunc("/api/groups/join", middleware.AuthMiddleware(handlers.JoinGroupHandler))
	http.HandleFunc("/api/groups/members", middleware.AuthMiddleware(handlers.GetGroupMembersHandler))

	// Chore routes - existing - all protected
	http.HandleFunc("/api/chores/individual", middleware.AuthMiddleware(handlers.CreateIndividualChoreHandler))
	http.HandleFunc("/api/chores/recurring", middleware.AuthMiddleware(handlers.CreateRecurringChoreHandler))
	http.HandleFunc("/api/chores/user", middleware.AuthMiddleware(handlers.GetUserChoresHandler))

	// Chore routes - new - all protected
	http.HandleFunc("/api/chores/complete", middleware.AuthMiddleware(handlers.CompleteChoreHandler))
	http.HandleFunc("/api/chores/group", middleware.AuthMiddleware(handlers.GetGroupChoresHandler))
	http.HandleFunc("/api/chores/group/recurring", middleware.AuthMiddleware(handlers.GetGroupRecurringChoresHandler))
	http.HandleFunc("/api/chores/update", middleware.AuthMiddleware(handlers.UpdateChoreHandler))
	http.HandleFunc("/api/chores/delete", middleware.AuthMiddleware(handlers.DeleteChoreHandler))
	http.HandleFunc("/api/chores/recurring/update", middleware.AuthMiddleware(handlers.UpdateRecurringChoreHandler))
	http.HandleFunc("/api/chores/recurring/delete", middleware.AuthMiddleware(handlers.DeleteRecurringChoreHandler))

	log.Println("Server starting on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

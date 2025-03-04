package main

import (
	"cribb-backend/config"
	"cribb-backend/handlers"
	"cribb-backend/jobs"
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

	// User routes
	http.HandleFunc("/api/users", handlers.GetUsersHandler)
	http.HandleFunc("/api/users/by-username", handlers.GetUserByUsernameHandler)
	http.HandleFunc("/api/users/by-score", handlers.GetUsersByScoreHandler)

	// Group routes
	http.HandleFunc("/api/groups", handlers.CreateGroupHandler)
	http.HandleFunc("/api/groups/join", handlers.JoinGroupHandler)
	http.HandleFunc("/api/groups/members", handlers.GetGroupMembersHandler)

	// Chore routes - existing
	http.HandleFunc("/api/chores/individual", handlers.CreateIndividualChoreHandler)
	http.HandleFunc("/api/chores/recurring", handlers.CreateRecurringChoreHandler)
	http.HandleFunc("/api/chores/user", handlers.GetUserChoresHandler)

	// Chore routes - new
	http.HandleFunc("/api/chores/complete", handlers.CompleteChoreHandler)
	http.HandleFunc("/api/chores/group", handlers.GetGroupChoresHandler)
	http.HandleFunc("/api/chores/group/recurring", handlers.GetGroupRecurringChoresHandler)
	http.HandleFunc("/api/chores/update", handlers.UpdateChoreHandler)
	http.HandleFunc("/api/chores/delete", handlers.DeleteChoreHandler)
	http.HandleFunc("/api/chores/recurring/update", handlers.UpdateRecurringChoreHandler)
	http.HandleFunc("/api/chores/recurring/delete", handlers.DeleteRecurringChoreHandler)

	log.Println("Server starting on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

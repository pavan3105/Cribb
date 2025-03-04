// middleware/auth.go
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v4"
)

// User context key type to avoid collision
type contextKey string

const UserContextKey contextKey = "user"

// UserClaims holds data stored in JWT
type UserClaims struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

// AuthMiddleware is a middleware for authenticating requests with JWT
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header is required", http.StatusUnauthorized)
			return
		}

		// Check if it's a Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Authorization header format must be Bearer {token}", http.StatusUnauthorized)
			return
		}

		// Extract token
		tokenString := parts[1]

		// Parse and validate the token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate the signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.NewValidationError("unexpected signing method", jwt.ValidationErrorSignatureInvalid)
			}
			return []byte("your_jwt_secret_key_here"), nil // same secret used for token creation
		})

		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Check if token is valid
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// Extract user information from claims
			userClaims := UserClaims{
				ID:       claims["id"].(string),
				Username: claims["username"].(string),
			}

			// Add user claims to request context
			ctx := context.WithValue(r.Context(), UserContextKey, userClaims)

			// Call the next handler with our new context
			next(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}
	}
}

// GetUserFromContext extracts user claims from the request context
func GetUserFromContext(ctx context.Context) (UserClaims, bool) {
	user, ok := ctx.Value(UserContextKey).(UserClaims)
	return user, ok
}

// CORSMiddleware handles Cross-Origin Resource Sharing
func CORSMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*") // For development, in production use your specific domain
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Call the next handler
		next(w, r)
	}
}

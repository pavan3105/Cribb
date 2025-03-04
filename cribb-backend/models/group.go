package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Group struct {
	ID        primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Name      string               `bson:"name" json:"name" validate:"required,min=3"`
	Members   []primitive.ObjectID `bson:"members" json:"members"`
	CreatedAt time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time            `bson:"updated_at" json:"updated_at"`
}

func NewGroup(name string) *Group {
	return &Group{
		Name:      name,
		Members:   make([]primitive.ObjectID, 0),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

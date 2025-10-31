package service

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/bisosad1501/ielts-platform/notification-service/internal/models"
	"github.com/google/uuid"
)

// NotificationBroadcaster manages SSE connections and broadcasts notifications
type NotificationBroadcaster struct {
	clients map[uuid.UUID]map[chan []byte]bool // userID -> channels
	mu      sync.RWMutex
}

// NewNotificationBroadcaster creates a new broadcaster
func NewNotificationBroadcaster() *NotificationBroadcaster {
	return &NotificationBroadcaster{
		clients: make(map[uuid.UUID]map[chan []byte]bool),
	}
}

// Subscribe adds a new client connection for a user
func (nb *NotificationBroadcaster) Subscribe(userID uuid.UUID) chan []byte {
	nb.mu.Lock()
	defer nb.mu.Unlock()

	if nb.clients[userID] == nil {
		nb.clients[userID] = make(map[chan []byte]bool)
	}

	ch := make(chan []byte, 10) // Buffer to prevent blocking
	nb.clients[userID][ch] = true

	log.Printf("[Notification-Broadcaster] ✅ Subscribed user %s (total clients: %d)", userID, len(nb.clients[userID]))
	return ch
}

// Unsubscribe removes a client connection
func (nb *NotificationBroadcaster) Unsubscribe(userID uuid.UUID, ch chan []byte) {
	nb.mu.Lock()
	defer nb.mu.Unlock()

	if nb.clients[userID] != nil {
		delete(nb.clients[userID], ch)
		close(ch)

		if len(nb.clients[userID]) == 0 {
			delete(nb.clients, userID)
		}

		log.Printf("[Notification-Broadcaster] ❌ Unsubscribed user %s (remaining clients: %d)", userID, len(nb.clients[userID]))
	}
}

// Broadcast sends a notification to all clients of a specific user
func (nb *NotificationBroadcaster) Broadcast(userID uuid.UUID, notification *models.Notification) {
	nb.mu.RLock()
	defer nb.mu.RUnlock()

	clients, exists := nb.clients[userID]
	if !exists || len(clients) == 0 {
		return // No clients connected
	}

	// Convert notification to JSON
	data, err := json.Marshal(notification)
	if err != nil {
		log.Printf("[Notification-Broadcaster] ❌ Failed to marshal notification: %v", err)
		return
	}

	// Send to all clients (non-blocking)
	sentCount := 0
	for ch := range clients {
		select {
		case ch <- data:
			sentCount++
		default:
			// Channel is full, skip
			log.Printf("[Notification-Broadcaster] ⚠️ Channel full for user %s, skipping", userID)
		}
	}

	if sentCount > 0 {
		log.Printf("[Notification-Broadcaster] ✅ Broadcasted notification to %d client(s) for user %s", sentCount, userID)
	}
}


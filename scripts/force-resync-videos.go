package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
	"google.golang.org/api/option"
	"google.golang.org/api/youtube/v3"
)

func main() {
	// YouTube API Key
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	if apiKey == "" {
		apiKey = "AIzaSyCqCx1s7ZPmIrHmLpnQS_AC1O4ZlGD3Q6s"
	}

	// Connect to database
	connStr := "host=localhost port=5432 user=ielts_admin password=ielts_password_2025 dbname=course_db sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Initialize YouTube service
	service, err := youtube.NewService(option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatalf("Error creating YouTube service: %v", err)
	}

	// Get all YouTube videos
	rows, err := db.Query(`
		SELECT video_id, title, duration_seconds 
		FROM lesson_videos 
		WHERE video_provider = 'youtube' 
		  AND video_id IS NOT NULL 
		  AND video_id != ''
	`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("🔄 Force re-syncing all YouTube videos...")
	fmt.Println()

	successCount := 0
	failCount := 0

	for rows.Next() {
		var videoID, title string
		var currentDuration int

		err := rows.Scan(&videoID, &title, &currentDuration)
		if err != nil {
			log.Printf("Error scanning row: %v", err)
			continue
		}

		// Fetch from YouTube API
		call := service.Videos.List([]string{"contentDetails"}).Id(videoID)
		response, err := call.Do()
		if err != nil {
			log.Printf("❌ Failed to fetch %s: %v", videoID, err)
			failCount++
			continue
		}

		if len(response.Items) == 0 {
			log.Printf("❌ Video not found: %s", videoID)
			failCount++
			continue
		}

		// Parse ISO 8601 duration
		isoDuration := response.Items[0].ContentDetails.Duration
		newDuration := parseISO8601Duration(isoDuration)

		// Update database
		_, err = db.Exec(`
			UPDATE lesson_videos 
			SET duration_seconds = $1, updated_at = NOW() 
			WHERE video_id = $2
		`, newDuration, videoID)
		if err != nil {
			log.Printf("❌ Failed to update %s: %v", videoID, err)
			failCount++
			continue
		}

		fmt.Printf("✅ %s: %ds -> %ds (%s)\n",
			videoID, currentDuration, newDuration, formatDuration(newDuration))
		successCount++
	}

	fmt.Println()
	fmt.Printf("🎉 Complete: %d success, %d failed\n", successCount, failCount)
}

func parseISO8601Duration(duration string) int {
	// Simple parser for PT1H20M23S format
	var hours, minutes, seconds int
	fmt.Sscanf(duration, "PT%dH%dM%dS", &hours, &minutes, &seconds)
	if hours == 0 {
		fmt.Sscanf(duration, "PT%dM%dS", &minutes, &seconds)
	}
	if minutes == 0 && hours == 0 {
		fmt.Sscanf(duration, "PT%dS", &seconds)
	}
	return hours*3600 + minutes*60 + seconds
}

func formatDuration(seconds int) string {
	hours := seconds / 3600
	minutes := (seconds % 3600) / 60
	secs := seconds % 60
	if hours > 0 {
		return fmt.Sprintf("%dh%dm%ds", hours, minutes, secs)
	} else if minutes > 0 {
		return fmt.Sprintf("%dm%ds", minutes, secs)
	}
	return fmt.Sprintf("%ds", secs)
}

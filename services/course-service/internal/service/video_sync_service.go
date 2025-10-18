package service

import (
	"fmt"
	"log"
	"time"

	"github.com/bisosad1501/ielts-platform/course-service/internal/repository"
	"github.com/google/uuid"
)

// VideoSyncService handles background synchronization of video durations
type VideoSyncService struct {
	repo           *repository.CourseRepository
	youtubeService *YouTubeService
	ticker         *time.Ticker
	stopChan       chan bool
}

// NewVideoSyncService creates a new video sync service
func NewVideoSyncService(repo *repository.CourseRepository, youtubeService *YouTubeService) *VideoSyncService {
	return &VideoSyncService{
		repo:           repo,
		youtubeService: youtubeService,
		stopChan:       make(chan bool),
	}
}

// StartPeriodicSync starts background job that runs every 24 hours
func (s *VideoSyncService) StartPeriodicSync() {
	if s.youtubeService == nil {
		log.Println("[VideoSync] YouTube service not available, periodic sync disabled")
		return
	}

	// Run immediately on start
	go s.SyncMissingDurations()

	// Then run every 24 hours
	s.ticker = time.NewTicker(24 * time.Hour)

	go func() {
		log.Println("[VideoSync] ✅ Periodic sync started (every 24 hours)")
		for {
			select {
			case <-s.ticker.C:
				log.Println("[VideoSync] Running scheduled sync...")
				s.SyncMissingDurations()
			case <-s.stopChan:
				log.Println("[VideoSync] Stopping periodic sync...")
				s.ticker.Stop()
				return
			}
		}
	}()
}

// Stop stops the periodic sync
func (s *VideoSyncService) Stop() {
	if s.ticker != nil {
		s.stopChan <- true
	}
}

// SyncMissingDurations syncs duration for all YouTube videos with missing or zero duration
func (s *VideoSyncService) SyncMissingDurations() {
	log.Println("[VideoSync] 🔄 Starting duration sync for videos with missing/zero duration...")

	// Get all YouTube videos without duration
	videos, err := s.repo.GetVideosWithMissingDuration()
	if err != nil {
		log.Printf("[VideoSync] ❌ Error fetching videos: %v", err)
		return
	}

	if len(videos) == 0 {
		log.Println("[VideoSync] ✅ All videos have duration, nothing to sync")
		return
	}

	log.Printf("[VideoSync] Found %d videos without duration, syncing...", len(videos))

	successCount := 0
	failCount := 0

	for _, video := range videos {
		if video.VideoProvider != "youtube" || video.VideoID == nil || *video.VideoID == "" {
			continue
		}

		videoID := *video.VideoID

		// Fetch duration from YouTube API
		duration, err := s.youtubeService.GetVideoDuration(videoID)
		if err != nil {
			log.Printf("[VideoSync] ⚠️  Failed to fetch duration for video_id=%s: %v", videoID, err)
			failCount++
			continue
		}

		// Update video duration and auto-sync lesson duration
		err = s.repo.UpdateVideoDurationAndSyncLesson(videoID, int(duration))
		if err != nil {
			log.Printf("[VideoSync] ❌ Failed to update duration for video_id=%s: %v", videoID, err)
			failCount++
			continue
		}

		durationMins := int(duration / 60)
		log.Printf("[VideoSync] ✅ Updated video_id=%s: %d seconds (%d mins) + synced lesson",
			videoID, duration, durationMins)
		successCount++

		// Rate limiting: sleep 100ms between API calls to avoid quota issues
		time.Sleep(100 * time.Millisecond)
	}

	log.Printf("[VideoSync] 🎉 Sync complete: %d success, %d failed", successCount, failCount)
}

// ForceResyncAllVideos force re-syncs duration for ALL YouTube videos (regardless of current duration)
func (s *VideoSyncService) ForceResyncAllVideos() (int, int, error) {
	if s.youtubeService == nil {
		return 0, 0, fmt.Errorf("YouTube service not available")
	}

	log.Println("[VideoSync] 🔄 Force re-syncing ALL YouTube videos...")

	// Get ALL YouTube videos (not just missing duration)
	videos, err := s.repo.GetAllYouTubeVideos()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to fetch videos: %w", err)
	}

	if len(videos) == 0 {
		log.Println("[VideoSync] No YouTube videos found")
		return 0, 0, nil
	}

	log.Printf("[VideoSync] Found %d YouTube videos, force re-syncing all...", len(videos))

	successCount := 0
	failCount := 0

	for _, video := range videos {
		if video.VideoID == nil || *video.VideoID == "" {
			continue
		}

		videoID := *video.VideoID

		// Fetch duration from YouTube API
		duration, err := s.youtubeService.GetVideoDuration(videoID)
		if err != nil {
			log.Printf("[VideoSync] ⚠️  Failed to fetch duration for video_id=%s: %v", videoID, err)
			failCount++
			continue
		}

		// Update video duration and auto-sync lesson duration
		err = s.repo.UpdateVideoDurationAndSyncLesson(videoID, int(duration))
		if err != nil {
			log.Printf("[VideoSync] ❌ Failed to update duration for video_id=%s: %v", videoID, err)
			failCount++
			continue
		}

		durationMins := int(duration / 60)
		log.Printf("[VideoSync] ✅ Force updated video_id=%s: %d seconds (%d mins) + synced lesson",
			videoID, duration, durationMins)
		successCount++

		// Rate limiting
		time.Sleep(100 * time.Millisecond)
	}

	log.Printf("[VideoSync] 🎉 Force re-sync complete: %d success, %d failed", successCount, failCount)
	return successCount, failCount, nil
}

// SyncSingleVideo manually syncs duration for a specific video
func (s *VideoSyncService) SyncSingleVideo(videoID string) error {
	if s.youtubeService == nil {
		return fmt.Errorf("YouTube service not available")
	}

	log.Printf("[VideoSync] Syncing single video: %s", videoID)

	duration, err := s.youtubeService.GetVideoDuration(videoID)
	if err != nil {
		return fmt.Errorf("failed to fetch duration: %w", err)
	}

	err = s.repo.UpdateVideoDurationAndSyncLesson(videoID, int(duration))
	if err != nil {
		return fmt.Errorf("failed to update duration: %w", err)
	}

	durationMins := int(duration / 60)
	log.Printf("[VideoSync] ✅ Updated video %s: %d seconds (%d mins) + synced lesson", videoID, duration, durationMins)
	return nil
}

// SyncLessonVideos syncs all videos in a specific lesson
func (s *VideoSyncService) SyncLessonVideos(lessonIDStr string) (int, error) {
	if s.youtubeService == nil {
		return 0, fmt.Errorf("YouTube service not available")
	}

	log.Printf("[VideoSync] Syncing all videos in lesson: %s", lessonIDStr)

	// Parse UUID
	lessonID, err := uuid.Parse(lessonIDStr)
	if err != nil {
		return 0, fmt.Errorf("invalid lesson ID: %w", err)
	}

	videos, err := s.repo.GetVideosByLessonID(lessonID)
	if err != nil {
		return 0, fmt.Errorf("failed to get lesson videos: %w", err)
	}

	successCount := 0
	for _, video := range videos {
		if video.VideoProvider != "youtube" || video.VideoID == nil || *video.VideoID == "" {
			continue
		}

		videoID := *video.VideoID

		duration, err := s.youtubeService.GetVideoDuration(videoID)
		if err != nil {
			log.Printf("[VideoSync] ⚠️  Failed to fetch duration for video_id=%s: %v", videoID, err)
			continue
		}

		err = s.repo.UpdateVideoDurationAndSyncLesson(videoID, int(duration))
		if err != nil {
			log.Printf("[VideoSync] ❌ Failed to update duration for video_id=%s: %v", videoID, err)
			continue
		}

		durationMins := int(duration / 60)
		log.Printf("[VideoSync] ✅ Updated video_id=%s: %d seconds (%d mins) + synced lesson", videoID, duration, durationMins)
		successCount++

		time.Sleep(100 * time.Millisecond) // Rate limiting
	}

	log.Printf("[VideoSync] Updated %d/%d videos in lesson %s", successCount, len(videos), lessonIDStr)
	return successCount, nil
}

// formatDuration converts seconds to human-readable format
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

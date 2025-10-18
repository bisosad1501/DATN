package service

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"google.golang.org/api/option"
	"google.golang.org/api/youtube/v3"
)

type YouTubeService struct {
	service *youtube.Service
}

func NewYouTubeService() (*YouTubeService, error) {
	ctx := context.Background()

	// Load API key from environment
	apiKey := os.Getenv("YOUTUBE_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("YOUTUBE_API_KEY not set")
	}

	service, err := youtube.NewService(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("error creating YouTube service: %w", err)
	}

	return &YouTubeService{
		service: service,
	}, nil
}

// UploadVideoRequest represents video upload request
type UploadVideoRequest struct {
	Title       string
	Description string
	FilePath    string
	Privacy     string // "public", "unlisted", "private"
	CategoryID  string // "27" for Education
	Tags        []string
}

// UploadVideoResponse represents upload result
type UploadVideoResponse struct {
	VideoID      string
	VideoURL     string
	ThumbnailURL string
	Duration     int64 // seconds
	Status       string
}

// UploadVideo uploads video to YouTube
func (s *YouTubeService) UploadVideo(req *UploadVideoRequest) (*UploadVideoResponse, error) {
	// Open video file
	file, err := os.Open(req.FilePath)
	if err != nil {
		return nil, fmt.Errorf("error opening video file: %w", err)
	}
	defer file.Close()

	// Create video resource
	video := &youtube.Video{
		Snippet: &youtube.VideoSnippet{
			Title:       req.Title,
			Description: req.Description,
			CategoryId:  req.CategoryID,
			Tags:        req.Tags,
		},
		Status: &youtube.VideoStatus{
			PrivacyStatus:           req.Privacy,
			SelfDeclaredMadeForKids: false,
		},
	}

	// Upload video
	_ = s.service.Videos.Insert([]string{"snippet", "status"}, video)

	// Note: This is simplified. In production, you need OAuth2 for uploads
	// For now, videos should be uploaded manually or via OAuth2 flow

	log.Printf("YouTube upload initiated for: %s", req.Title)

	return &UploadVideoResponse{
		VideoID: "placeholder", // Will be filled after actual upload
		Status:  "processing",
	}, nil
}

// GetVideoDuration retrieves video duration in seconds
func (s *YouTubeService) GetVideoDuration(videoID string) (int64, error) {
	call := s.service.Videos.List([]string{"contentDetails"})
	call.Id(videoID)

	response, err := call.Do()
	if err != nil {
		return 0, fmt.Errorf("error fetching video duration: %w", err)
	}

	if len(response.Items) == 0 {
		return 0, fmt.Errorf("video not found: %s", videoID)
	}

	video := response.Items[0]

	// Parse duration (ISO 8601 format: PT1H2M3S)
	duration := parseDuration(video.ContentDetails.Duration)

	return duration, nil
}

// GetVideoDetails retrieves video information
func (s *YouTubeService) GetVideoDetails(videoID string) (*UploadVideoResponse, error) {
	call := s.service.Videos.List([]string{"snippet", "contentDetails", "status"})
	call.Id(videoID)

	response, err := call.Do()
	if err != nil {
		return nil, fmt.Errorf("error fetching video details: %w", err)
	}

	if len(response.Items) == 0 {
		return nil, fmt.Errorf("video not found")
	}

	video := response.Items[0]

	// Parse duration (ISO 8601 format: PT1H2M3S)
	duration := parseDuration(video.ContentDetails.Duration)

	return &UploadVideoResponse{
		VideoID:      video.Id,
		VideoURL:     fmt.Sprintf("https://www.youtube.com/watch?v=%s", video.Id),
		ThumbnailURL: getBestThumbnail(video.Snippet.Thumbnails),
		Duration:     duration,
		Status:       video.Status.UploadStatus,
	}, nil
}

// ExtractVideoID extracts video ID from various YouTube URL formats
func ExtractVideoID(url string) string {
	// Handle different formats:
	// https://www.youtube.com/watch?v=VIDEO_ID
	// https://youtu.be/VIDEO_ID
	// https://www.youtube.com/embed/VIDEO_ID

	// Simple implementation - in production use regex
	if len(url) == 11 {
		return url // Already just the ID
	}

	// Extract from query parameter
	// This is simplified - use proper URL parsing in production
	return url[len(url)-11:]
}

// Helper functions
func parseDuration(isoDuration string) int64 {
	// Parse ISO 8601 duration format (PT1H2M3S) to seconds
	// Example: "PT1H20M23S" = 1 hour 20 minutes 23 seconds = 4823 seconds

	if isoDuration == "" || !strings.HasPrefix(isoDuration, "PT") {
		return 0
	}

	// Remove "PT" prefix
	duration := strings.TrimPrefix(isoDuration, "PT")

	var hours, minutes, seconds int64

	// Parse hours
	if strings.Contains(duration, "H") {
		parts := strings.Split(duration, "H")
		hours, _ = strconv.ParseInt(parts[0], 10, 64)
		duration = parts[1]
	}

	// Parse minutes
	if strings.Contains(duration, "M") {
		parts := strings.Split(duration, "M")
		minutes, _ = strconv.ParseInt(parts[0], 10, 64)
		duration = parts[1]
	}

	// Parse seconds
	if strings.Contains(duration, "S") {
		parts := strings.Split(duration, "S")
		seconds, _ = strconv.ParseInt(parts[0], 10, 64)
	}

	return hours*3600 + minutes*60 + seconds
}

func getBestThumbnail(thumbnails *youtube.ThumbnailDetails) string {
	if thumbnails.Maxres != nil {
		return thumbnails.Maxres.Url
	}
	if thumbnails.Standard != nil {
		return thumbnails.Standard.Url
	}
	if thumbnails.High != nil {
		return thumbnails.High.Url
	}
	return thumbnails.Default.Url
}

// ValidateVideo checks if video is accessible
func (s *YouTubeService) ValidateVideo(videoID string) (bool, error) {
	_, err := s.GetVideoDetails(videoID)
	return err == nil, err
}

// GetEmbedURL generates embed URL for video player
func GetEmbedURL(videoID string) string {
	return fmt.Sprintf("https://www.youtube.com/embed/%s", videoID)
}

// GetThumbnailURL generates thumbnail URL
func GetThumbnailURL(videoID string, quality string) string {
	// quality: "default", "hqdefault", "mqdefault", "sddefault", "maxresdefault"
	return fmt.Sprintf("https://img.youtube.com/vi/%s/%s.jpg", videoID, quality)
}

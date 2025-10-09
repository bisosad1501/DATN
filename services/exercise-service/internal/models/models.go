package models

import (
	"time"

	"github.com/google/uuid"
)

// Exercise represents an exercise/test
type Exercise struct {
	ID                    uuid.UUID  `json:"id"`
	Title                 string     `json:"title"`
	Slug                  string     `json:"slug"`
	Description           *string    `json:"description,omitempty"`
	ExerciseType          string     `json:"exercise_type"` // practice, mock_test, full_test, mini_test
	SkillType             string     `json:"skill_type"`    // listening, reading
	Difficulty            string     `json:"difficulty"`    // easy, medium, hard
	IELTSLevel            *string    `json:"ielts_level,omitempty"`
	TotalQuestions        int        `json:"total_questions"`
	TotalSections         int        `json:"total_sections"`
	TimeLimitMinutes      *int       `json:"time_limit_minutes,omitempty"`
	ThumbnailURL          *string    `json:"thumbnail_url,omitempty"`
	AudioURL              *string    `json:"audio_url,omitempty"`
	AudioDurationSeconds  *int       `json:"audio_duration_seconds,omitempty"`
	AudioTranscript       *string    `json:"audio_transcript,omitempty"`
	PassageCount          *int       `json:"passage_count,omitempty"`
	CourseID              *uuid.UUID `json:"course_id,omitempty"`
	LessonID              *uuid.UUID `json:"lesson_id,omitempty"`
	PassingScore          *float64   `json:"passing_score,omitempty"`
	TotalPoints           *float64   `json:"total_points,omitempty"`
	IsFree                bool       `json:"is_free"`
	IsPublished           bool       `json:"is_published"`
	TotalAttempts         int        `json:"total_attempts"`
	AverageScore          *float64   `json:"average_score,omitempty"`
	AverageCompletionTime *int       `json:"average_completion_time,omitempty"`
	DisplayOrder          int        `json:"display_order"`
	CreatedBy             uuid.UUID  `json:"created_by"`
	PublishedAt           *time.Time `json:"published_at,omitempty"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

// ExerciseSection represents a section within an exercise
type ExerciseSection struct {
	ID               uuid.UUID  `json:"id"`
	ExerciseID       uuid.UUID  `json:"exercise_id"`
	Title            string     `json:"title"`
	Description      *string    `json:"description,omitempty"`
	SectionNumber    int        `json:"section_number"`
	AudioURL         *string    `json:"audio_url,omitempty"`
	AudioStartTime   *int       `json:"audio_start_time,omitempty"`
	AudioEndTime     *int       `json:"audio_end_time,omitempty"`
	Transcript       *string    `json:"transcript,omitempty"`
	PassageTitle     *string    `json:"passage_title,omitempty"`
	PassageContent   *string    `json:"passage_content,omitempty"`
	PassageWordCount *int       `json:"passage_word_count,omitempty"`
	Instructions     *string    `json:"instructions,omitempty"`
	TotalQuestions   int        `json:"total_questions"`
	TimeLimitMinutes *int       `json:"time_limit_minutes,omitempty"`
	DisplayOrder     int        `json:"display_order"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

// Question represents a question in an exercise
type Question struct {
	ID             uuid.UUID  `json:"id"`
	ExerciseID     uuid.UUID  `json:"exercise_id"`
	SectionID      *uuid.UUID `json:"section_id,omitempty"`
	QuestionNumber int        `json:"question_number"`
	QuestionText   string     `json:"question_text"`
	QuestionType   string     `json:"question_type"` // multiple_choice, true_false_not_given, matching, fill_in_blank, etc.
	AudioURL       *string    `json:"audio_url,omitempty"`
	ImageURL       *string    `json:"image_url,omitempty"`
	ContextText    *string    `json:"context_text,omitempty"`
	Points         float64    `json:"points"`
	Difficulty     *string    `json:"difficulty,omitempty"`
	Explanation    *string    `json:"explanation,omitempty"`
	Tips           *string    `json:"tips,omitempty"`
	DisplayOrder   int        `json:"display_order"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// QuestionOption represents an option for multiple choice questions
type QuestionOption struct {
	ID              uuid.UUID  `json:"id"`
	QuestionID      uuid.UUID  `json:"question_id"`
	OptionLabel     string     `json:"option_label"` // A, B, C, D
	OptionText      string     `json:"option_text"`
	OptionImageURL  *string    `json:"option_image_url,omitempty"`
	IsCorrect       bool       `json:"is_correct"`
	DisplayOrder    int        `json:"display_order"`
	CreatedAt       time.Time  `json:"created_at"`
}

// QuestionAnswer represents correct answer for fill-in-blank, matching, etc.
type QuestionAnswer struct {
	ID                  uuid.UUID  `json:"id"`
	QuestionID          uuid.UUID  `json:"question_id"`
	AnswerText          string     `json:"answer_text"`
	AlternativeAnswers  *string    `json:"alternative_answers,omitempty"` // JSON array
	IsCaseSensitive     bool       `json:"is_case_sensitive"`
	MatchingOrder       *int       `json:"matching_order,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
}

// Submission represents a student's submission (maps to user_exercise_attempts table)
type Submission struct {
	ID                uuid.UUID  `json:"id"`
	UserID            uuid.UUID  `json:"user_id"`
	ExerciseID        uuid.UUID  `json:"exercise_id"`
	AttemptNumber     int        `json:"attempt_number"`
	Status            string     `json:"status"` // in_progress, completed, abandoned
	TotalQuestions    int        `json:"total_questions"`
	QuestionsAnswered int        `json:"questions_answered"`
	CorrectAnswers    int        `json:"correct_answers"`
	Score             *float64   `json:"score,omitempty"`             // Percentage or points
	BandScore         *float64   `json:"band_score,omitempty"`        // IELTS band score
	TimeLimitMinutes  *int       `json:"time_limit_minutes,omitempty"`
	TimeSpentSeconds  int        `json:"time_spent_seconds"`
	StartedAt         time.Time  `json:"started_at"`
	CompletedAt       *time.Time `json:"completed_at,omitempty"`
	DeviceType        *string    `json:"device_type,omitempty"` // web, android, ios
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

// SubmissionAnswer represents an answer in a submission (maps to user_answers table)
type SubmissionAnswer struct {
	ID               uuid.UUID  `json:"id"`
	AttemptID        uuid.UUID  `json:"attempt_id"` // FK to user_exercise_attempts
	QuestionID       uuid.UUID  `json:"question_id"`
	UserID           uuid.UUID  `json:"user_id"`
	AnswerText       *string    `json:"answer_text,omitempty"`
	SelectedOptionID *uuid.UUID `json:"selected_option_id,omitempty"`
	IsCorrect        *bool      `json:"is_correct,omitempty"`
	PointsEarned     *float64   `json:"points_earned,omitempty"`
	TimeSpentSeconds *int       `json:"time_spent_seconds,omitempty"`
	AnsweredAt       time.Time  `json:"answered_at"`
}

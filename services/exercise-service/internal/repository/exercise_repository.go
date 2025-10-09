package repository

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/bisosad1501/ielts-platform/exercise-service/internal/models"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ExerciseRepository struct {
	db *sql.DB
}

func NewExerciseRepository(db *sql.DB) *ExerciseRepository {
	return &ExerciseRepository{db: db}
}

// GetExercises returns paginated list with filters
func (r *ExerciseRepository) GetExercises(query *models.ExerciseListQuery) ([]models.Exercise, int, error) {
	where := []string{"is_published = true"}
	args := []interface{}{}
	argCount := 0

	if query.SkillType != "" {
		argCount++
		where = append(where, fmt.Sprintf("skill_type = $%d", argCount))
		args = append(args, query.SkillType)
	}

	if query.Difficulty != "" {
		argCount++
		where = append(where, fmt.Sprintf("difficulty = $%d", argCount))
		args = append(args, query.Difficulty)
	}

	if query.ExerciseType != "" {
		argCount++
		where = append(where, fmt.Sprintf("exercise_type = $%d", argCount))
		args = append(args, query.ExerciseType)
	}

	if query.IsFree != nil {
		argCount++
		where = append(where, fmt.Sprintf("is_free = $%d", argCount))
		args = append(args, *query.IsFree)
	}

	if query.CourseID != nil {
		argCount++
		where = append(where, fmt.Sprintf("course_id = $%d", argCount))
		args = append(args, *query.CourseID)
	}

	if query.LessonID != nil {
		argCount++
		where = append(where, fmt.Sprintf("lesson_id = $%d", argCount))
		args = append(args, *query.LessonID)
	}

	if query.Search != "" {
		argCount++
		where = append(where, fmt.Sprintf("(title ILIKE $%d OR description ILIKE $%d)", argCount, argCount))
		args = append(args, "%"+query.Search+"%")
	}

	whereClause := strings.Join(where, " AND ")

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM exercises WHERE %s", whereClause)
	var total int
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	offset := (query.Page - 1) * query.Limit
	argCount++
	limitArg := argCount
	argCount++
	offsetArg := argCount

	selectQuery := fmt.Sprintf(`
		SELECT id, title, slug, description, exercise_type, skill_type, difficulty,
			ielts_level, total_questions, total_sections, time_limit_minutes,
			thumbnail_url, audio_url, audio_duration_seconds, audio_transcript,
			passage_count, course_id, lesson_id, passing_score, total_points,
			is_free, is_published, total_attempts, average_score,
			average_completion_time, display_order, created_by, published_at,
			created_at, updated_at
		FROM exercises 
		WHERE %s 
		ORDER BY display_order, created_at DESC 
		LIMIT $%d OFFSET $%d
	`, whereClause, limitArg, offsetArg)

	args = append(args, query.Limit, offset)

	rows, err := r.db.Query(selectQuery, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	exercises := []models.Exercise{}
	for rows.Next() {
		var e models.Exercise
		err := rows.Scan(
			&e.ID, &e.Title, &e.Slug, &e.Description, &e.ExerciseType, &e.SkillType,
			&e.Difficulty, &e.IELTSLevel, &e.TotalQuestions, &e.TotalSections,
			&e.TimeLimitMinutes, &e.ThumbnailURL, &e.AudioURL, &e.AudioDurationSeconds,
			&e.AudioTranscript, &e.PassageCount, &e.CourseID, &e.LessonID,
			&e.PassingScore, &e.TotalPoints, &e.IsFree, &e.IsPublished,
			&e.TotalAttempts, &e.AverageScore, &e.AverageCompletionTime,
			&e.DisplayOrder, &e.CreatedBy, &e.PublishedAt, &e.CreatedAt, &e.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		exercises = append(exercises, e)
	}

	return exercises, total, nil
}

// GetExerciseByID returns exercise with sections and questions
func (r *ExerciseRepository) GetExerciseByID(id uuid.UUID) (*models.ExerciseDetailResponse, error) {
	// Get exercise
	var exercise models.Exercise
	err := r.db.QueryRow(`
		SELECT id, title, slug, description, exercise_type, skill_type, difficulty,
			ielts_level, total_questions, total_sections, time_limit_minutes,
			thumbnail_url, audio_url, audio_duration_seconds, audio_transcript,
			passage_count, course_id, lesson_id, passing_score, total_points,
			is_free, is_published, total_attempts, average_score,
			average_completion_time, display_order, created_by, published_at,
			created_at, updated_at
		FROM exercises WHERE id = $1 AND is_published = true
	`, id).Scan(
		&exercise.ID, &exercise.Title, &exercise.Slug, &exercise.Description,
		&exercise.ExerciseType, &exercise.SkillType, &exercise.Difficulty,
		&exercise.IELTSLevel, &exercise.TotalQuestions, &exercise.TotalSections,
		&exercise.TimeLimitMinutes, &exercise.ThumbnailURL, &exercise.AudioURL,
		&exercise.AudioDurationSeconds, &exercise.AudioTranscript, &exercise.PassageCount,
		&exercise.CourseID, &exercise.LessonID, &exercise.PassingScore,
		&exercise.TotalPoints, &exercise.IsFree, &exercise.IsPublished,
		&exercise.TotalAttempts, &exercise.AverageScore, &exercise.AverageCompletionTime,
		&exercise.DisplayOrder, &exercise.CreatedBy, &exercise.PublishedAt,
		&exercise.CreatedAt, &exercise.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Get sections with questions
	sections, err := r.GetSectionsWithQuestions(id)
	if err != nil {
		return nil, err
	}

	return &models.ExerciseDetailResponse{
		Exercise: &exercise,
		Sections: sections,
	}, nil
}

// GetSectionsWithQuestions returns sections with their questions
func (r *ExerciseRepository) GetSectionsWithQuestions(exerciseID uuid.UUID) ([]models.SectionWithQuestions, error) {
	// Get sections
	sectionRows, err := r.db.Query(`
		SELECT id, exercise_id, title, description, section_number, audio_url,
			audio_start_time, audio_end_time, transcript, passage_title,
			passage_content, passage_word_count, instructions, total_questions,
			time_limit_minutes, display_order, created_at, updated_at
		FROM exercise_sections 
		WHERE exercise_id = $1 
		ORDER BY display_order, section_number
	`, exerciseID)
	if err != nil {
		return nil, err
	}
	defer sectionRows.Close()

	sections := []models.SectionWithQuestions{}
	for sectionRows.Next() {
		var section models.ExerciseSection
		err := sectionRows.Scan(
			&section.ID, &section.ExerciseID, &section.Title, &section.Description,
			&section.SectionNumber, &section.AudioURL, &section.AudioStartTime,
			&section.AudioEndTime, &section.Transcript, &section.PassageTitle,
			&section.PassageContent, &section.PassageWordCount, &section.Instructions,
			&section.TotalQuestions, &section.TimeLimitMinutes, &section.DisplayOrder,
			&section.CreatedAt, &section.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get questions for this section
		questions, err := r.GetQuestionsWithOptions(section.ID)
		if err != nil {
			return nil, err
		}

		sections = append(sections, models.SectionWithQuestions{
			Section:   &section,
			Questions: questions,
		})
	}

	return sections, nil
}

// GetQuestionsWithOptions returns questions with their options
func (r *ExerciseRepository) GetQuestionsWithOptions(sectionID uuid.UUID) ([]models.QuestionWithOptions, error) {
	questionRows, err := r.db.Query(`
		SELECT id, exercise_id, section_id, question_number, question_text,
			question_type, audio_url, image_url, context_text, points,
			difficulty, explanation, tips, display_order, created_at, updated_at
		FROM questions 
		WHERE section_id = $1 
		ORDER BY display_order, question_number
	`, sectionID)
	if err != nil {
		return nil, err
	}
	defer questionRows.Close()

	questions := []models.QuestionWithOptions{}
	for questionRows.Next() {
		var question models.Question
		err := questionRows.Scan(
			&question.ID, &question.ExerciseID, &question.SectionID,
			&question.QuestionNumber, &question.QuestionText, &question.QuestionType,
			&question.AudioURL, &question.ImageURL, &question.ContextText,
			&question.Points, &question.Difficulty, &question.Explanation,
			&question.Tips, &question.DisplayOrder, &question.CreatedAt,
			&question.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get options based on question type
		var options []models.QuestionOption

		if question.QuestionType == "multiple_choice" || question.QuestionType == "matching" {
			optionRows, err := r.db.Query(`
				SELECT id, question_id, option_label, option_text, option_image_url,
					is_correct, display_order, created_at
				FROM question_options 
				WHERE question_id = $1 
				ORDER BY display_order
			`, question.ID)
			if err != nil {
				return nil, err
			}
			defer optionRows.Close()

			for optionRows.Next() {
				var option models.QuestionOption
				err := optionRows.Scan(
					&option.ID, &option.QuestionID, &option.OptionLabel,
					&option.OptionText, &option.OptionImageURL, &option.IsCorrect,
					&option.DisplayOrder, &option.CreatedAt,
				)
				if err != nil {
					return nil, err
				}
				options = append(options, option)
			}
		}
		// Note: For text-based questions, answers are not included in public view

		questions = append(questions, models.QuestionWithOptions{
			Question: &question,
			Options:  options,
		})
	}

	return questions, nil
}

// CreateSubmission starts a new submission (uses user_exercise_attempts table)
func (r *ExerciseRepository) CreateSubmission(userID, exerciseID uuid.UUID, deviceType *string) (*models.Submission, error) {
	// Get exercise details
	var totalQuestions int
	var timeLimitMinutes *int
	err := r.db.QueryRow(`
		SELECT total_questions, time_limit_minutes 
		FROM exercises 
		WHERE id = $1
	`, exerciseID).Scan(&totalQuestions, &timeLimitMinutes)
	if err != nil {
		return nil, err
	}

	// Calculate attempt number
	var attemptNumber int
	err = r.db.QueryRow(`
		SELECT COALESCE(MAX(attempt_number), 0) + 1
		FROM user_exercise_attempts
		WHERE user_id = $1 AND exercise_id = $2
	`, userID, exerciseID).Scan(&attemptNumber)
	if err != nil {
		return nil, err
	}

	submission := &models.Submission{
		ID:                uuid.New(),
		UserID:            userID,
		ExerciseID:        exerciseID,
		AttemptNumber:     attemptNumber,
		Status:            "in_progress",
		TotalQuestions:    totalQuestions,
		QuestionsAnswered: 0,
		CorrectAnswers:    0,
		TimeSpentSeconds:  0,
		TimeLimitMinutes:  timeLimitMinutes,
		StartedAt:         time.Now(),
		DeviceType:        deviceType,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	_, err = r.db.Exec(`
		INSERT INTO user_exercise_attempts (
			id, user_id, exercise_id, attempt_number, status, 
			total_questions, questions_answered, correct_answers, 
			time_limit_minutes, time_spent_seconds, started_at, device_type,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`, submission.ID, submission.UserID, submission.ExerciseID, submission.AttemptNumber,
		submission.Status, submission.TotalQuestions, submission.QuestionsAnswered,
		submission.CorrectAnswers, submission.TimeLimitMinutes, submission.TimeSpentSeconds,
		submission.StartedAt, submission.DeviceType, submission.CreatedAt, submission.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return submission, nil
}

// SaveSubmissionAnswers saves all answers and grades submission
func (r *ExerciseRepository) SaveSubmissionAnswers(submissionID uuid.UUID, answers []models.SubmitAnswerItem) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Get user_id once before loop
	var userID uuid.UUID
	err = tx.QueryRow(`
		SELECT user_id FROM user_exercise_attempts WHERE id = $1
	`, submissionID).Scan(&userID)
	if err != nil {
		return err
	}

	for _, answer := range answers {
		// Get question details for grading
		var questionType string
		var points float64
		err := tx.QueryRow(`
			SELECT question_type, points FROM questions WHERE id = $1
		`, answer.QuestionID).Scan(&questionType, &points)
		if err != nil {
			return err
		}

		isCorrect := false
		pointsEarned := 0.0

		// Grade based on question type
		if questionType == "multiple_choice" || questionType == "matching" {
			if answer.SelectedOptionID != nil {
				var optionIsCorrect bool
				err = tx.QueryRow(`
					SELECT is_correct FROM question_options 
					WHERE id = $1
				`, *answer.SelectedOptionID).Scan(&optionIsCorrect)
				if err == nil && optionIsCorrect {
					isCorrect = true
					pointsEarned = points
				}
			}
		} else {
			// Text-based questions (fill-in-blank, short_answer)
			if answer.TextAnswer != nil && *answer.TextAnswer != "" {
				var answerText string
				var answerVariations pq.StringArray
				err = tx.QueryRow(`
					SELECT answer_text, COALESCE(answer_variations, '{}')
					FROM question_answers 
					WHERE question_id = $1
				`, answer.QuestionID).Scan(&answerText, &answerVariations)

				if err == nil {
					// Case-insensitive comparison by default
					userAnswer := strings.ToLower(strings.TrimSpace(*answer.TextAnswer))
					answerText = strings.ToLower(answerText)

					// Check main answer
					if userAnswer == answerText {
						isCorrect = true
						pointsEarned = points
					} else {
						// Check alternative answer variations
						for _, alt := range answerVariations {
							if strings.ToLower(alt) == userAnswer {
								isCorrect = true
								pointsEarned = points
								break
							}
						}
					}
				}
			}
		}

		// Save user answer
		_, err = tx.Exec(`
			INSERT INTO user_answers (
				id, attempt_id, question_id, user_id, answer_text, selected_option_id,
				is_correct, points_earned, time_spent_seconds, answered_at
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, uuid.New(), submissionID, answer.QuestionID, userID, answer.TextAnswer,
			answer.SelectedOptionID, isCorrect, pointsEarned, answer.TimeSpentSeconds,
			time.Now())
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// CompleteSubmission finalizes submission and calculates final score (uses user_exercise_attempts)
func (r *ExerciseRepository) CompleteSubmission(submissionID uuid.UUID) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Get attempt details
	var startedAt time.Time
	var totalQuestions int
	var exerciseID uuid.UUID
	err = tx.QueryRow(`
		SELECT started_at, total_questions, exercise_id 
		FROM user_exercise_attempts 
		WHERE id = $1
	`, submissionID).Scan(&startedAt, &totalQuestions, &exerciseID)
	if err != nil {
		return err
	}

	// Calculate statistics from user_answers
	var correctCount int
	var totalPointsEarned float64
	var totalTimeSpent int
	var questionsAnswered int

	err = tx.QueryRow(`
		SELECT 
			COUNT(*) as answered,
			COUNT(CASE WHEN is_correct = true THEN 1 END) as correct,
			COALESCE(SUM(points_earned), 0) as points,
			COALESCE(SUM(time_spent_seconds), 0) as time_spent
		FROM user_answers
		WHERE attempt_id = $1
	`, submissionID).Scan(&questionsAnswered, &correctCount, &totalPointsEarned, &totalTimeSpent)
	if err != nil {
		return err
	}

	// Get total points and passing score from exercise
	var totalPoints float64
	var passingScore float64
	err = tx.QueryRow(`
		SELECT COALESCE(total_points, 0), COALESCE(passing_score, 0)
		FROM exercises 
		WHERE id = $1
	`, exerciseID).Scan(&totalPoints, &passingScore)
	if err != nil {
		return err
	}

	// Calculate score
	score := totalPointsEarned

	// Calculate IELTS band score (0-9 scale)
	// Mapping: 0-4 correct = 0-3, 5-12 = 3.5-4.5, 13-20 = 5-6, 21-28 = 6.5-7.5, 29-35 = 8-8.5, 36-40 = 9
	bandScore := 0.0
	if totalQuestions > 0 {
		correctPercentage := float64(correctCount) / float64(totalQuestions) * 100
		switch {
		case correctPercentage < 12.5: // 0-12.5%
			bandScore = 0.0 + (correctPercentage / 12.5 * 3.0)
		case correctPercentage < 30: // 12.5-30%
			bandScore = 3.0 + ((correctPercentage - 12.5) / 17.5 * 1.5)
		case correctPercentage < 50: // 30-50%
			bandScore = 4.5 + ((correctPercentage - 30) / 20 * 1.0)
		case correctPercentage < 70: // 50-70%
			bandScore = 5.5 + ((correctPercentage - 50) / 20 * 1.5)
		case correctPercentage < 85: // 70-85%
			bandScore = 7.0 + ((correctPercentage - 70) / 15 * 1.0)
		case correctPercentage < 95: // 85-95%
			bandScore = 8.0 + ((correctPercentage - 85) / 10 * 0.5)
		default: // 95-100%
			bandScore = 8.5 + ((correctPercentage - 95) / 5 * 0.5)
		}
	}

	// Calculate time spent (seconds since started)
	timeSpent := int(time.Since(startedAt).Seconds())
	if totalTimeSpent > 0 {
		timeSpent = totalTimeSpent
	}

	// Update attempt
	_, err = tx.Exec(`
		UPDATE user_exercise_attempts SET
			completed_at = $1,
			time_spent_seconds = $2,
			questions_answered = $3,
			correct_answers = $4,
			score = $5,
			band_score = $6,
			status = 'completed',
			updated_at = $7
		WHERE id = $8
	`, time.Now(), timeSpent, questionsAnswered, correctCount,
		score, bandScore, time.Now(), submissionID)
	if err != nil {
		return err
	}

	// Update exercise statistics
	_, err = tx.Exec(`
		UPDATE exercises SET
			total_attempts = total_attempts + 1,
			average_score = (
				SELECT AVG(score)
				FROM user_exercise_attempts
				WHERE exercise_id = $1 AND status = 'completed'
			),
			average_completion_time = (
				SELECT AVG(time_spent_seconds)
				FROM user_exercise_attempts
				WHERE exercise_id = $1 AND status = 'completed'
			),
			updated_at = $2
		WHERE id = $1
	`, exerciseID, time.Now())
	if err != nil {
		return err
	}

	return tx.Commit()
}

// GetSubmissionResult returns detailed submission result (uses user_exercise_attempts)
func (r *ExerciseRepository) GetSubmissionResult(submissionID uuid.UUID) (*models.SubmissionResultResponse, error) {
	// Get attempt
	var submission models.Submission
	err := r.db.QueryRow(`
		SELECT id, user_id, exercise_id, attempt_number, status, total_questions,
			questions_answered, correct_answers, score, band_score, 
			time_limit_minutes, time_spent_seconds, started_at, completed_at,
			device_type, created_at, updated_at
		FROM user_exercise_attempts WHERE id = $1
	`, submissionID).Scan(
		&submission.ID, &submission.UserID, &submission.ExerciseID,
		&submission.AttemptNumber, &submission.Status, &submission.TotalQuestions,
		&submission.QuestionsAnswered, &submission.CorrectAnswers, &submission.Score,
		&submission.BandScore, &submission.TimeLimitMinutes, &submission.TimeSpentSeconds,
		&submission.StartedAt, &submission.CompletedAt, &submission.DeviceType,
		&submission.CreatedAt, &submission.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Get exercise
	var exercise models.Exercise
	err = r.db.QueryRow(`
		SELECT id, title, slug, description, exercise_type, skill_type, difficulty,
			ielts_level, total_questions, total_sections, time_limit_minutes,
			thumbnail_url, audio_url, audio_duration_seconds, audio_transcript,
			passage_count, course_id, lesson_id, passing_score, total_points,
			is_free, is_published, total_attempts, average_score,
			average_completion_time, display_order, created_by, published_at,
			created_at, updated_at
		FROM exercises WHERE id = $1
	`, submission.ExerciseID).Scan(
		&exercise.ID, &exercise.Title, &exercise.Slug, &exercise.Description,
		&exercise.ExerciseType, &exercise.SkillType, &exercise.Difficulty,
		&exercise.IELTSLevel, &exercise.TotalQuestions, &exercise.TotalSections,
		&exercise.TimeLimitMinutes, &exercise.ThumbnailURL, &exercise.AudioURL,
		&exercise.AudioDurationSeconds, &exercise.AudioTranscript, &exercise.PassageCount,
		&exercise.CourseID, &exercise.LessonID, &exercise.PassingScore,
		&exercise.TotalPoints, &exercise.IsFree, &exercise.IsPublished,
		&exercise.TotalAttempts, &exercise.AverageScore, &exercise.AverageCompletionTime,
		&exercise.DisplayOrder, &exercise.CreatedBy, &exercise.PublishedAt,
		&exercise.CreatedAt, &exercise.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Get answers with questions (from user_answers table)
	rows, err := r.db.Query(`
		SELECT ua.id, ua.attempt_id, ua.question_id, ua.user_id, ua.answer_text,
			ua.selected_option_id, ua.is_correct, ua.points_earned, ua.time_spent_seconds,
			ua.answered_at,
			q.id, q.exercise_id, q.section_id, q.question_number, q.question_text,
			q.question_type, q.audio_url, q.image_url, q.context_text, q.points,
			q.difficulty, q.explanation, q.tips, q.display_order, q.created_at, q.updated_at
		FROM user_answers ua
		JOIN questions q ON q.id = ua.question_id
		WHERE ua.attempt_id = $1
		ORDER BY q.display_order, q.question_number
	`, submissionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	answers := []models.SubmissionAnswerWithQuestion{}
	for rows.Next() {
		var submissionAnswer models.SubmissionAnswer
		var question models.Question
		err := rows.Scan(
			&submissionAnswer.ID, &submissionAnswer.AttemptID, &submissionAnswer.QuestionID,
			&submissionAnswer.UserID, &submissionAnswer.AnswerText, &submissionAnswer.SelectedOptionID,
			&submissionAnswer.IsCorrect, &submissionAnswer.PointsEarned, &submissionAnswer.TimeSpentSeconds,
			&submissionAnswer.AnsweredAt,
			&question.ID, &question.ExerciseID, &question.SectionID, &question.QuestionNumber,
			&question.QuestionText, &question.QuestionType, &question.AudioURL, &question.ImageURL,
			&question.ContextText, &question.Points, &question.Difficulty, &question.Explanation,
			&question.Tips, &question.DisplayOrder, &question.CreatedAt, &question.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get correct answer
		var correctAnswer interface{}
		if question.QuestionType == "multiple_choice" {
			var correctText string
			err := r.db.QueryRow(`
				SELECT option_text FROM question_options 
				WHERE question_id = $1 AND is_correct = true
			`, question.ID).Scan(&correctText)
			if err == nil {
				correctAnswer = correctText
			}
		} else {
			var correctText string
			err := r.db.QueryRow(`
				SELECT answer_text FROM question_answers 
				WHERE question_id = $1
			`, question.ID).Scan(&correctText)
			if err == nil {
				correctAnswer = correctText
			}
		}

		answers = append(answers, models.SubmissionAnswerWithQuestion{
			Answer:        &submissionAnswer,
			Question:      &question,
			CorrectAnswer: correctAnswer,
		})
	}

	// Calculate performance stats
	correctCount := submission.CorrectAnswers
	incorrectCount := submission.QuestionsAnswered - submission.CorrectAnswers
	skippedCount := submission.TotalQuestions - submission.QuestionsAnswered

	accuracy := 0.0
	if submission.TotalQuestions > 0 {
		accuracy = float64(correctCount) / float64(submission.TotalQuestions) * 100
	}

	avgTimePerQuestion := 0
	if submission.TotalQuestions > 0 {
		avgTimePerQuestion = submission.TimeSpentSeconds / submission.TotalQuestions
	}

	score := 0.0
	if submission.Score != nil {
		score = *submission.Score
	}

	// Calculate percentage from score and total points
	percentage := 0.0
	if exercise.TotalPoints != nil && *exercise.TotalPoints > 0 {
		percentage = (score / *exercise.TotalPoints) * 100
	}

	// Check if passed
	isPassed := false
	if exercise.PassingScore != nil && *exercise.PassingScore > 0 {
		isPassed = percentage >= *exercise.PassingScore
	}

	stats := &models.PerformanceStats{
		TotalQuestions:   submission.TotalQuestions,
		CorrectAnswers:   correctCount,
		IncorrectAnswers: incorrectCount,
		SkippedAnswers:   skippedCount,
		Accuracy:         accuracy,
		Score:            score,
		Percentage:       percentage,
		BandScore:        submission.BandScore,
		IsPassed:         isPassed,
		TimeSpentSeconds: submission.TimeSpentSeconds,
		AverageTimePerQ:  float64(avgTimePerQuestion),
	}

	return &models.SubmissionResultResponse{
		Submission:  &submission,
		Exercise:    &exercise,
		Answers:     answers,
		Performance: stats,
	}, nil
}

// GetUserSubmissions returns user's submission history (uses user_exercise_attempts)
func (r *ExerciseRepository) GetUserSubmissions(userID uuid.UUID, page, limit int) (*models.MySubmissionsResponse, error) {
	offset := (page - 1) * limit

	// Get total count
	var total int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM user_exercise_attempts WHERE user_id = $1
	`, userID).Scan(&total)
	if err != nil {
		return nil, err
	}

	// Get attempts with exercise info
	rows, err := r.db.Query(`
		SELECT a.id, a.user_id, a.exercise_id, a.attempt_number, a.status,
			a.total_questions, a.questions_answered, a.correct_answers, a.score, a.band_score,
			a.time_limit_minutes, a.time_spent_seconds, a.started_at, a.completed_at,
			a.device_type, a.created_at, a.updated_at,
			e.id, e.title, e.slug, e.description, e.exercise_type, e.skill_type, e.difficulty,
			e.ielts_level, e.total_questions, e.total_sections, e.time_limit_minutes,
			e.thumbnail_url, e.audio_url, e.audio_duration_seconds, e.audio_transcript,
			e.passage_count, e.course_id, e.lesson_id, e.passing_score, e.total_points,
			e.is_free, e.is_published, e.total_attempts, e.average_score,
			e.average_completion_time, e.display_order, e.created_by, e.published_at,
			e.created_at, e.updated_at
		FROM user_exercise_attempts a
		JOIN exercises e ON e.id = a.exercise_id
		WHERE a.user_id = $1
		ORDER BY a.created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	submissions := []models.SubmissionWithExercise{}
	for rows.Next() {
		var submission models.Submission
		var exercise models.Exercise
		err := rows.Scan(
			&submission.ID, &submission.UserID, &submission.ExerciseID, &submission.AttemptNumber,
			&submission.Status, &submission.TotalQuestions, &submission.QuestionsAnswered,
			&submission.CorrectAnswers, &submission.Score, &submission.BandScore,
			&submission.TimeLimitMinutes, &submission.TimeSpentSeconds, &submission.StartedAt,
			&submission.CompletedAt, &submission.DeviceType, &submission.CreatedAt, &submission.UpdatedAt,
			&exercise.ID, &exercise.Title, &exercise.Slug, &exercise.Description,
			&exercise.ExerciseType, &exercise.SkillType, &exercise.Difficulty,
			&exercise.IELTSLevel, &exercise.TotalQuestions, &exercise.TotalSections,
			&exercise.TimeLimitMinutes, &exercise.ThumbnailURL, &exercise.AudioURL,
			&exercise.AudioDurationSeconds, &exercise.AudioTranscript, &exercise.PassageCount,
			&exercise.CourseID, &exercise.LessonID, &exercise.PassingScore,
			&exercise.TotalPoints, &exercise.IsFree, &exercise.IsPublished,
			&exercise.TotalAttempts, &exercise.AverageScore, &exercise.AverageCompletionTime,
			&exercise.DisplayOrder, &exercise.CreatedBy, &exercise.PublishedAt,
			&exercise.CreatedAt, &exercise.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		submissions = append(submissions, models.SubmissionWithExercise{
			Submission: &submission,
			Exercise:   &exercise,
		})
	}

	return &models.MySubmissionsResponse{
		Submissions: submissions,
		Total:       total,
	}, nil
}

// CreateExercise creates a new exercise (admin only)
func (r *ExerciseRepository) CreateExercise(req *models.CreateExerciseRequest, createdBy uuid.UUID) (*models.Exercise, error) {
	isFree := false
	if req.IsFree != nil {
		isFree = *req.IsFree
	}

	exercise := &models.Exercise{
		ID:                   uuid.New(),
		Title:                req.Title,
		Slug:                 req.Slug,
		Description:          req.Description,
		ExerciseType:         req.ExerciseType,
		SkillType:            req.SkillType,
		Difficulty:           req.Difficulty,
		IELTSLevel:           req.IELTSLevel,
		TotalQuestions:       0, // Will be calculated
		TotalSections:        0, // Will be calculated
		TimeLimitMinutes:     req.TimeLimitMinutes,
		ThumbnailURL:         req.ThumbnailURL,
		AudioURL:             req.AudioURL,
		AudioDurationSeconds: req.AudioDurationSeconds,
		PassageCount:         req.PassageCount,
		CourseID:             req.CourseID,
		LessonID:             req.LessonID,
		PassingScore:         req.PassingScore,
		IsFree:               isFree,
		IsPublished:          false, // Default unpublished
		DisplayOrder:         0,
		CreatedBy:            createdBy,
		CreatedAt:            time.Now(),
		UpdatedAt:            time.Now(),
	}

	_, err := r.db.Exec(`
		INSERT INTO exercises (
			id, title, slug, description, exercise_type, skill_type, difficulty,
			ielts_level, total_questions, total_sections, time_limit_minutes,
			thumbnail_url, audio_url, audio_duration_seconds, audio_transcript,
			passage_count, course_id, lesson_id, passing_score, total_points,
			is_free, is_published, display_order, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
	`, exercise.ID, exercise.Title, exercise.Slug, exercise.Description,
		exercise.ExerciseType, exercise.SkillType, exercise.Difficulty,
		exercise.IELTSLevel, exercise.TotalQuestions, exercise.TotalSections,
		exercise.TimeLimitMinutes, exercise.ThumbnailURL, exercise.AudioURL,
		exercise.AudioDurationSeconds, exercise.AudioTranscript, exercise.PassageCount,
		exercise.CourseID, exercise.LessonID, exercise.PassingScore,
		exercise.TotalPoints, exercise.IsFree, exercise.IsPublished,
		exercise.DisplayOrder, exercise.CreatedBy, exercise.CreatedAt, exercise.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return exercise, nil
}

// UpdateExercise updates exercise details (admin only)
func (r *ExerciseRepository) UpdateExercise(id uuid.UUID, req *models.UpdateExerciseRequest) error {
	updates := []string{"updated_at = $1"}
	args := []interface{}{time.Now()}
	argCount := 1

	if req.Title != nil {
		argCount++
		updates = append(updates, fmt.Sprintf("title = $%d", argCount))
		args = append(args, *req.Title)
	}
	if req.Description != nil {
		argCount++
		updates = append(updates, fmt.Sprintf("description = $%d", argCount))
		args = append(args, *req.Description)
	}
	if req.Difficulty != nil {
		argCount++
		updates = append(updates, fmt.Sprintf("difficulty = $%d", argCount))
		args = append(args, *req.Difficulty)
	}
	if req.TimeLimitMinutes != nil {
		argCount++
		updates = append(updates, fmt.Sprintf("time_limit_minutes = $%d", argCount))
		args = append(args, *req.TimeLimitMinutes)
	}
	if req.PassingScore != nil {
		argCount++
		updates = append(updates, fmt.Sprintf("passing_score = $%d", argCount))
		args = append(args, *req.PassingScore)
	}
	if req.IsPublished != nil {
		argCount++
		updates = append(updates, fmt.Sprintf("is_published = $%d", argCount))
		args = append(args, *req.IsPublished)
		if *req.IsPublished {
			argCount++
			updates = append(updates, fmt.Sprintf("published_at = $%d", argCount))
			args = append(args, time.Now())
		}
	}

	argCount++
	args = append(args, id)

	query := fmt.Sprintf("UPDATE exercises SET %s WHERE id = $%d", strings.Join(updates, ", "), argCount)
	_, err := r.db.Exec(query, args...)
	return err
}

// DeleteExercise soft deletes an exercise
func (r *ExerciseRepository) DeleteExercise(id uuid.UUID) error {
	_, err := r.db.Exec("UPDATE exercises SET is_published = false, updated_at = $1 WHERE id = $2", time.Now(), id)
	return err
}

// CheckExerciseOwnership verifies if user owns the exercise
func (r *ExerciseRepository) CheckExerciseOwnership(exerciseID, userID uuid.UUID) error {
	var createdBy uuid.UUID
	err := r.db.QueryRow("SELECT created_by FROM exercises WHERE id = $1", exerciseID).Scan(&createdBy)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("exercise not found")
		}
		return err
	}
	if createdBy != userID {
		return fmt.Errorf("unauthorized: you don't own this exercise")
	}
	return nil
}

// CreateSection creates a new section for an exercise
func (r *ExerciseRepository) CreateSection(exerciseID uuid.UUID, req *models.CreateSectionRequest) (*models.ExerciseSection, error) {
	section := &models.ExerciseSection{
		ID:               uuid.New(),
		ExerciseID:       exerciseID,
		Title:            req.Title,
		Description:      req.Description,
		SectionNumber:    req.SectionNumber,
		AudioURL:         req.AudioURL,
		AudioStartTime:   req.AudioStartTime,
		AudioEndTime:     req.AudioEndTime,
		Transcript:       req.Transcript,
		PassageTitle:     req.PassageTitle,
		PassageContent:   req.PassageContent,
		PassageWordCount: req.PassageWordCount,
		Instructions:     req.Instructions,
		TotalQuestions:   0, // Will be calculated
		TimeLimitMinutes: req.TimeLimitMinutes,
		DisplayOrder:     req.DisplayOrder,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	_, err := r.db.Exec(`
		INSERT INTO exercise_sections (
			id, exercise_id, title, description, section_number, audio_url,
			audio_start_time, audio_end_time, transcript, passage_title,
			passage_content, passage_word_count, instructions, total_questions,
			time_limit_minutes, display_order, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
	`, section.ID, section.ExerciseID, section.Title, section.Description,
		section.SectionNumber, section.AudioURL, section.AudioStartTime,
		section.AudioEndTime, section.Transcript, section.PassageTitle,
		section.PassageContent, section.PassageWordCount, section.Instructions,
		section.TotalQuestions, section.TimeLimitMinutes, section.DisplayOrder,
		section.CreatedAt, section.UpdatedAt)

	if err != nil {
		return nil, err
	}

	// Update exercise total_sections count
	_, err = r.db.Exec(`
		UPDATE exercises SET 
			total_sections = (SELECT COUNT(*) FROM exercise_sections WHERE exercise_id = $1),
			updated_at = $2
		WHERE id = $1
	`, exerciseID, time.Now())

	return section, err
}

// CreateQuestion creates a new question
func (r *ExerciseRepository) CreateQuestion(req *models.CreateQuestionRequest) (*models.Question, error) {
	points := 1.0
	if req.Points != nil {
		points = *req.Points
	}

	question := &models.Question{
		ID:             uuid.New(),
		ExerciseID:     req.ExerciseID,
		SectionID:      req.SectionID,
		QuestionNumber: req.QuestionNumber,
		QuestionText:   req.QuestionText,
		QuestionType:   req.QuestionType,
		AudioURL:       req.AudioURL,
		ImageURL:       req.ImageURL,
		ContextText:    req.ContextText,
		Points:         points,
		Difficulty:     req.Difficulty,
		Explanation:    req.Explanation,
		Tips:           req.Tips,
		DisplayOrder:   req.DisplayOrder,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err := r.db.Exec(`
		INSERT INTO questions (
			id, exercise_id, section_id, question_number, question_text, question_type,
			audio_url, image_url, context_text, points, difficulty, explanation,
			tips, display_order, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`, question.ID, question.ExerciseID, question.SectionID, question.QuestionNumber,
		question.QuestionText, question.QuestionType, question.AudioURL, question.ImageURL,
		question.ContextText, question.Points, question.Difficulty, question.Explanation,
		question.Tips, question.DisplayOrder, question.CreatedAt, question.UpdatedAt)

	if err != nil {
		return nil, err
	}

	// Update section and exercise total_questions count
	if req.SectionID != nil {
		_, err = r.db.Exec(`
			UPDATE exercise_sections SET 
				total_questions = (SELECT COUNT(*) FROM questions WHERE section_id = $1),
				updated_at = $2
			WHERE id = $1
		`, *req.SectionID, time.Now())
	}

	_, err = r.db.Exec(`
		UPDATE exercises SET 
			total_questions = (SELECT COUNT(*) FROM questions WHERE exercise_id = $1),
			total_points = (SELECT COALESCE(SUM(points), 0) FROM questions WHERE exercise_id = $1),
			updated_at = $2
		WHERE id = $1
	`, req.ExerciseID, time.Now())

	return question, err
}

// CreateQuestionOption creates an option for multiple choice question
func (r *ExerciseRepository) CreateQuestionOption(questionID uuid.UUID, req *models.CreateQuestionOptionRequest) (*models.QuestionOption, error) {
	option := &models.QuestionOption{
		ID:             uuid.New(),
		QuestionID:     questionID,
		OptionLabel:    req.OptionLabel,
		OptionText:     req.OptionText,
		OptionImageURL: req.OptionImageURL,
		IsCorrect:      req.IsCorrect,
		DisplayOrder:   req.DisplayOrder,
		CreatedAt:      time.Now(),
	}

	_, err := r.db.Exec(`
		INSERT INTO question_options (
			id, question_id, option_label, option_text, option_image_url,
			is_correct, display_order, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, option.ID, option.QuestionID, option.OptionLabel, option.OptionText,
		option.OptionImageURL, option.IsCorrect, option.DisplayOrder, option.CreatedAt)

	return option, err
}

// CreateQuestionAnswer creates answer for text-based question
func (r *ExerciseRepository) CreateQuestionAnswer(questionID uuid.UUID, req *models.CreateQuestionAnswerRequest) (*models.QuestionAnswer, error) {
	var alternativeAnswersJSON *string
	if req.AlternativeAnswers != nil && len(req.AlternativeAnswers) > 0 {
		jsonBytes, _ := json.Marshal(req.AlternativeAnswers)
		jsonStr := string(jsonBytes)
		alternativeAnswersJSON = &jsonStr
	}

	answer := &models.QuestionAnswer{
		ID:                 uuid.New(),
		QuestionID:         questionID,
		AnswerText:         req.AnswerText,
		AlternativeAnswers: alternativeAnswersJSON,
		IsCaseSensitive:    req.IsCaseSensitive,
		MatchingOrder:      req.MatchingOrder,
		CreatedAt:          time.Now(),
	}

	// Convert to array for PostgreSQL using pq.Array
	var answerVariations interface{}
	if req.AlternativeAnswers != nil && len(req.AlternativeAnswers) > 0 {
		answerVariations = pq.Array(req.AlternativeAnswers)
	}

	_, err := r.db.Exec(`
		INSERT INTO question_answers (
			id, question_id, answer_text, answer_variations,
			is_primary_answer, created_at
		) VALUES ($1, $2, $3, $4, $5, $6)
	`, answer.ID, answer.QuestionID, answer.AnswerText, answerVariations,
		true, answer.CreatedAt)

	return answer, err
}

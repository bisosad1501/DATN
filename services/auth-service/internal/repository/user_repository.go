package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/bisosad1501/DATN/services/auth-service/internal/models"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type UserRepository interface {
	Create(user *models.User) error
	Delete(userID uuid.UUID) error
	FindByID(id uuid.UUID) (*models.User, error)
	FindByEmail(email string) (*models.User, error)
	FindByGoogleID(googleID string) (*models.User, error)
	FindOrCreateByGoogleID(googleID, email, name string) (*models.User, error)
	Update(user *models.User) error
	UpdateLoginInfo(userID uuid.UUID, ip string) error
	IncrementFailedAttempts(userID uuid.UUID) error
	ResetFailedAttempts(userID uuid.UUID) error
	LockAccount(userID uuid.UUID, duration time.Duration) error
	IsAccountLocked(userID uuid.UUID) (bool, error)
}

type userRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *models.User) error {
	query := `
		INSERT INTO users (id, email, password_hash, phone, is_active, is_verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	now := time.Now()
	user.ID = uuid.New()
	user.CreatedAt = now
	user.UpdatedAt = now
	user.IsActive = true
	user.IsVerified = false

	err := r.db.QueryRowx(query,
		user.ID,
		user.Email,
		user.Password,
		user.Phone,
		user.IsActive,
		user.IsVerified,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *userRepository) FindByID(id uuid.UUID) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, phone, is_active, is_verified, email_verified_at,
		       failed_login_attempts, locked_until, last_login_at, last_login_ip,
		       created_at, updated_at, deleted_at
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`

	var user models.User
	err := r.db.Get(&user, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	return &user, nil
}

func (r *userRepository) FindByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, phone, google_id, oauth_provider, 
		       is_active, is_verified, email_verified_at,
		       failed_login_attempts, locked_until, last_login_at, last_login_ip,
		       created_at, updated_at, deleted_at
		FROM users
		WHERE email = $1 AND deleted_at IS NULL
	`

	var user models.User
	err := r.db.Get(&user, query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	return &user, nil
}

func (r *userRepository) FindByGoogleID(googleID string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, phone, google_id, oauth_provider,
		       is_active, is_verified, email_verified_at,
		       failed_login_attempts, locked_until, last_login_at, last_login_ip,
		       created_at, updated_at, deleted_at
		FROM users
		WHERE google_id = $1 AND deleted_at IS NULL
	`

	var user models.User
	err := r.db.Get(&user, query, googleID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	return &user, nil
}

func (r *userRepository) FindOrCreateByGoogleID(googleID, email, name string) (*models.User, error) {
	// Try to find existing user
	user, err := r.FindByGoogleID(googleID)
	if err == nil {
		return user, nil
	}

	// Check if user exists with this email (non-Google account)
	existingUser, err := r.FindByEmail(email)
	if err == nil && existingUser.GoogleID == nil {
		// Link Google ID to existing account
		query := `
			UPDATE users 
			SET google_id = $1, oauth_provider = $2, is_verified = true, 
			    email_verified_at = $3, updated_at = $4
			WHERE id = $5
			RETURNING id, email, password_hash, phone, google_id, oauth_provider,
			          is_active, is_verified, email_verified_at,
			          failed_login_attempts, locked_until, last_login_at, last_login_ip,
			          created_at, updated_at, deleted_at
		`
		now := time.Now()
		provider := "google"
		err := r.db.Get(existingUser, query, googleID, provider, now, now, existingUser.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to link Google account: %w", err)
		}
		return existingUser, nil
	}

	// Create new user
	query := `
		INSERT INTO users (id, email, google_id, oauth_provider, is_active, is_verified, 
		                   email_verified_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, email, password_hash, phone, google_id, oauth_provider,
		          is_active, is_verified, email_verified_at,
		          failed_login_attempts, locked_until, last_login_at, last_login_ip,
		          created_at, updated_at, deleted_at
	`

	now := time.Now()
	newUser := &models.User{}
	err = r.db.Get(newUser, query,
		uuid.New(),
		email,
		googleID,
		"google",
		true,
		true,
		now,
		now,
		now,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return newUser, nil
}

func (r *userRepository) Update(user *models.User) error {
	query := `
		UPDATE users
		SET email = $2, password_hash = $3, phone = $4, is_active = $5, 
		    is_verified = $6, email_verified_at = $7, updated_at = $8
		WHERE id = $1
	`

	user.UpdatedAt = time.Now()

	_, err := r.db.Exec(query,
		user.ID,
		user.Email,
		user.Password,
		user.Phone,
		user.IsActive,
		user.IsVerified,
		user.EmailVerifiedAt,
		user.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}

	return nil
}

func (r *userRepository) UpdateLoginInfo(userID uuid.UUID, ip string) error {
	query := `
		UPDATE users
		SET last_login_at = $2, last_login_ip = $3, updated_at = $4
		WHERE id = $1
	`

	now := time.Now()
	_, err := r.db.Exec(query, userID, now, ip, now)
	if err != nil {
		return fmt.Errorf("failed to update login info: %w", err)
	}

	return nil
}

func (r *userRepository) IncrementFailedAttempts(userID uuid.UUID) error {
	query := `
		UPDATE users
		SET failed_login_attempts = failed_login_attempts + 1, updated_at = $2
		WHERE id = $1
	`

	_, err := r.db.Exec(query, userID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to increment failed attempts: %w", err)
	}

	return nil
}

func (r *userRepository) ResetFailedAttempts(userID uuid.UUID) error {
	query := `
		UPDATE users
		SET failed_login_attempts = 0, locked_until = NULL, updated_at = $2
		WHERE id = $1
	`

	_, err := r.db.Exec(query, userID, time.Now())
	if err != nil {
		return fmt.Errorf("failed to reset failed attempts: %w", err)
	}

	return nil
}

func (r *userRepository) LockAccount(userID uuid.UUID, duration time.Duration) error {
	query := `
		UPDATE users
		SET locked_until = $2, updated_at = $3
		WHERE id = $1
	`

	lockedUntil := time.Now().Add(duration)
	_, err := r.db.Exec(query, userID, lockedUntil, time.Now())
	if err != nil {
		return fmt.Errorf("failed to lock account: %w", err)
	}

	return nil
}

func (r *userRepository) IsAccountLocked(userID uuid.UUID) (bool, error) {
	query := `
		SELECT locked_until
		FROM users
		WHERE id = $1 AND deleted_at IS NULL
	`

	var lockedUntil sql.NullTime
	err := r.db.QueryRow(query, userID).Scan(&lockedUntil)
	if err != nil {
		return false, fmt.Errorf("failed to check account lock: %w", err)
	}

	if lockedUntil.Valid && lockedUntil.Time.After(time.Now()) {
		return true, nil
	}

	return false, nil
}

// Delete soft-deletes a user (for rollback scenarios)
func (r *userRepository) Delete(userID uuid.UUID) error {
	query := `
		UPDATE users
		SET deleted_at = CURRENT_TIMESTAMP
		WHERE id = $1 AND deleted_at IS NULL
	`

	result, err := r.db.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found or already deleted")
	}

	return nil
}
